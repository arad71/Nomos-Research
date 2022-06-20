from starlette import status

from app.db.dataimport import LEGACY_DATA_DIRECTORY

LOG_ENDPOINT = "/api/v1/dataimport"
WACENSUS_ENDPOINT = "/api/v1/dataimport/wacensus"


def test_import_wacensus_data_access(client, checklist_api_key):
    response = client.get(LOG_ENDPOINT)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.post(WACENSUS_ENDPOINT)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.post(WACENSUS_ENDPOINT, headers={"x-api-key": checklist_api_key})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_data_import_log_file(client, import_api_key):
    log_file_contents = "Create a new text file!"
    with open(f"{LEGACY_DATA_DIRECTORY}/import.log", "w") as f:
        f.write(log_file_contents)
    response = client.get(LOG_ENDPOINT, headers={"x-api-key": import_api_key})
    assert response.text == log_file_contents
    # We do not test the post endpoint as this actually imports the data
