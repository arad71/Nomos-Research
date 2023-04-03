#!/usr/bin/env python
# A simple python script to fetch Nomos TaxonNames records from the API.
# 1: Retrieve a token from the server for use in subsequent requests.
# 2: Call the API for a single record and extract the number of records
# 3: Call the API requesting individual ranges of records using the range parameter
# 4: Put individual responses in a list
# 5: Put the list contents somewhere (eg. a file / MongoDB)


import json
import requests


def format_range(start: int, end: int) -> str:
    """
    Format value of range parameter
    :param start:
    :param end:
    :return:
    """
    return f"[{start},{end}]"


def fetch_names(token: str, cookies: object, server: str, start: int, end: int) -> \
    requests.Response:
    """
    Fetch taxon names from the API endpoint.
    :param token:
    :param cookies:
    :param server:
    :param start:
    :param end:
    :return:
    """
    return requests.get(
        f"{server}/api/v1/taxon_names",
        params={"range": (format_range(start, end))},
        headers={
            "accept": "application/json",
            "Authorization": f"Bearer {token}"
            ,
        }, cookies=cookies)


def get_token(server: str, cookies: object) -> str:
    """
    Retrieve an access token from a server based on specific cookies.
    :param server:
    :param cookies:
    :return:
    """
    ret = requests.post(f"{server}/api/auth2token", cookies=cookies)
    return ret.json()['access_token']


# server = "http://localhost:8000"
server = "https://nomos-test.bdr.wa.gov.au/"

cookies = {
    "dbca_wa_gov_au_session_uat":
    # You need a recent cookie from an auth2 session here - visit the server in your
    # browser and look for a cookie with a name like dbca_wa_gov_au_session_uat
        "180.150.83.135.27|AUTH2_01|09ab841363eb951c|3-auth201d5v8smjvyoxy6fa31bnmtpitxnmw3cktl0:bdr.wa.gov.au"
}

token = get_token(server, cookies)

first_response = fetch_names(token, cookies, server, 0, 1)
if first_response.status_code == 200:
    content_range = first_response.headers["content-range"]
    num_records = int(content_range.split("/")[1])
    print(f"A total of {num_records} records found")
    page_size = 1000
    count = 0
    records = []
    # Get batches of records from the server
    while count <= num_records:
        start = count
        count += page_size
        end = count - 1
        response = fetch_names(token, cookies, server, start, end)
        print(response.headers["content-range"])
        records = records + response.json()
    with open('taxon_names.json', 'w') as outfile:
        # And save them to a file
        json.dump(records, outfile, indent=2)
        print(f"A total of {len(records)} records saved to {outfile.name}")
else:
    print(f"Failed to access the API. Status code: {first_response.status_code} ")
    print(first_response.json())
