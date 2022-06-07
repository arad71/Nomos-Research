import pytest
from starlette import status

from app.db.vernacular.model import Vernacular


def test_get_vernaculars(client, test_vernacular, superuser_token_headers):
    response = client.get("/api/v1/vernaculars", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "vernacular_id": test_vernacular.vernacular_id,
            "taxon_name_id": test_vernacular.taxon_name_id,
            "taxon_name": response.json()[0]["taxon_name"],
            "vernacular": test_vernacular.vernacular,
            "language": test_vernacular.language.value,
            "enabled": test_vernacular.enabled,
            "updated_by": test_vernacular.updated_by,
            "updated_on": test_vernacular.updated_on.isoformat(),
            "created_by": test_vernacular.created_by,
            "created_on": test_vernacular.created_on.isoformat(),
        }
    ]


def test_delete_vernacular(client, test_vernacular, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert test_db.query(Vernacular).all() == []


def test_delete_vernacular_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/vernaculars/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_vernacular(
    client, test_vernacular, test_superuser, superuser_token_headers
):
    new_vernacular = {
        "taxon_name_id": test_vernacular.taxon_name_id,
        "vernacular": "Vernacular 2",
        "language": "english",
        "enabled": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_vernacular.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_vernacular.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        json=new_vernacular,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_vernacular["vernacular_id"] = test_vernacular.vernacular_id
    new_vernacular["taxon_name"] = response.json()["taxon_name"]
    new_vernacular["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_vernacular


def test_edit_vernacular_not_found(
    client, test_db, test_vernacular, test_superuser, superuser_token_headers
):
    new_vernacular = {
        "taxon_name_id": test_vernacular.taxon_name_id,
        "vernacular": "Vernacular 2",
        "language": "english",
        "enabled": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_vernacular.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_vernacular.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/vernaculars/1234", json=new_vernacular, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_vernacular(
    client,
    test_vernacular,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "vernacular_id": test_vernacular.vernacular_id,
        "taxon_name_id": test_vernacular.taxon_name_id,
        "taxon_name": response.json()["taxon_name"],
        "vernacular": test_vernacular.vernacular,
        "language": test_vernacular.language.value,
        "enabled": test_vernacular.enabled,
        "updated_by": test_vernacular.updated_by,
        "updated_on": test_vernacular.updated_on.isoformat(),
        "created_by": test_vernacular.created_by,
        "created_on": test_vernacular.created_on.isoformat(),
    }


def test_vernacular_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/vernaculars/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/vernaculars/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/vernaculars")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/vernaculars/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/vernaculars/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/vernaculars/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_vernacular,
    test_taxon_name_canonical_name_3,
    test_superuser,
):
    response = client.get("/api/v1/vernaculars", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    vernacular_json = {
        "taxon_name_id": test_taxon_name_canonical_name_3.taxon_name_id,
        "vernacular": "Vernacular 1",
        "language": "english",
        "enabled": True,
        "created_by": test_superuser.user_id,
    }
    response = client.post(
        "/api/v1/vernaculars", headers=superuser_token_headers, json=vernacular_json
    )
    assert response.status_code == status.HTTP_200_OK

    vernacular_id = response.json()["vernacular_id"]
    vernacular_json.update(
        {
            "updated_by": test_superuser.user_id,
            "updated_on": test_vernacular.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/vernaculars/{vernacular_id}",
        headers=superuser_token_headers,
        json=vernacular_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/vernaculars/{vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_manager_permissions(
    client,
    manager_token_headers,
    test_vernacular,
    test_taxon_name_canonical_name_3,
    test_manager,
):
    response = client.get("/api/v1/vernaculars", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    vernacular_json = {
        "taxon_name_id": test_taxon_name_canonical_name_3.taxon_name_id,
        "vernacular": "Vernacular 1",
        "language": "english",
        "enabled": True,
        "created_by": test_manager.user_id,
    }
    response = client.post(
        "/api/v1/vernaculars", headers=manager_token_headers, json=vernacular_json
    )
    assert response.status_code == status.HTTP_200_OK

    vernacular_id = response.json()["vernacular_id"]
    vernacular_json.update(
        {
            "updated_by": test_manager.user_id,
            "updated_on": test_vernacular.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/vernaculars/{vernacular_id}",
        headers=manager_token_headers,
        json=vernacular_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/vernaculars/{vernacular_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_officer_permissions(
    client,
    officer_token_headers,
    test_vernacular,
    test_taxon_name_canonical_name_3,
    test_officer,
):
    response = client.get("/api/v1/vernaculars", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    vernacular_json = {
        "taxon_name_id": test_taxon_name_canonical_name_3.taxon_name_id,
        "vernacular": "Vernacular 1",
        "language": "english",
        "enabled": True,
        "created_by": test_officer.user_id,
    }
    response = client.post(
        "/api/v1/vernaculars", headers=officer_token_headers, json=vernacular_json
    )
    assert response.status_code == status.HTTP_200_OK

    vernacular_id = response.json()["vernacular_id"]
    vernacular_json.update(
        {
            "updated_by": test_officer.user_id,
            "updated_on": test_vernacular.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/vernaculars/{vernacular_id}",
        headers=officer_token_headers,
        json=vernacular_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/vernaculars", status.HTTP_200_OK),
    ("put", "/api/v1/vernaculars/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/vernaculars/1", status.HTTP_403_FORBIDDEN),
    ("post", "/api/v1/vernaculars", status.HTTP_403_FORBIDDEN),
]


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_reader_permissions(
    client, reader_token_headers, method, endpoint, status_code
):
    response = getattr(client, method)(endpoint, headers=reader_token_headers)
    assert response.status_code == status_code


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_app_support_permissions(
    client, app_support_token_headers, method, endpoint, status_code
):
    response = getattr(client, method)(endpoint, headers=app_support_token_headers)
    assert response.status_code == status_code
