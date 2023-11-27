from unittest.mock import patch

from starlette import status

CALCULATION_ENDPOINT = "/api/v1/taxon_names_calculate"


def test_calculation_endpoint(
    client,
    superuser_token_headers,
    test_db,
):
    with patch("app.db.taxon_name.crud.TaxonNameCrud.calculate_name_formats") as mock:
        response = client.post(CALCULATION_ENDPOINT, headers=superuser_token_headers)
        mock.assert_called_once()
        assert response.status_code == 200


def test_anonymous_permission(client):
    response = client.get(CALCULATION_ENDPOINT)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.post(CALCULATION_ENDPOINT)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_reader_permissions(client, reader_token_headers):
    response = client.get(CALCULATION_ENDPOINT, headers=reader_token_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    with patch("app.db.taxon_name.crud.TaxonNameCrud.calculate_name_formats"):
        response = client.post(CALCULATION_ENDPOINT, headers=reader_token_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN


def test_manager_permissions(client, manager_token_headers):
    response = client.get(CALCULATION_ENDPOINT, headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK
    with patch("app.db.taxon_name.crud.TaxonNameCrud.calculate_name_formats"):
        response = client.post(CALCULATION_ENDPOINT, headers=manager_token_headers)
        assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(client, officer_token_headers):
    response = client.get(CALCULATION_ENDPOINT, headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK
    with patch("app.db.taxon_name.crud.TaxonNameCrud.calculate_name_formats"):
        response = client.post(CALCULATION_ENDPOINT, headers=officer_token_headers)
        assert response.status_code == status.HTTP_200_OK


def test_super_admin_permissions(client, superuser_token_headers):
    response = client.get(CALCULATION_ENDPOINT, headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    with patch("app.db.taxon_name.crud.TaxonNameCrud.calculate_name_formats"):
        response = client.post(CALCULATION_ENDPOINT, headers=superuser_token_headers)
        assert response.status_code == status.HTTP_200_OK
