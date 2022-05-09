from starlette import status


def test_import_wacensus_data_access(client, checklist_api_key):
    endpoint = "/api/v1/dataimport/wacensus"
    response = client.get(endpoint)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.post(endpoint)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.post(endpoint, headers={"x-api-key": checklist_api_key})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
