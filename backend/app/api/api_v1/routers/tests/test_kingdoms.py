import pytest
from starlette import status

from app.db.kingdom.model import Kingdom


def test_get_kingdoms(client, test_kingdom, superuser_token_headers):
    response = client.get("/api/v1/kingdoms", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "kingdom_id": test_kingdom.kingdom_id,
            "kingdom_name": test_kingdom.kingdom_name,
            "kingdom_desc": test_kingdom.kingdom_desc,
            "updated_by": test_kingdom.updated_by,
            "updated_on": test_kingdom.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_kingdom.created_by,
            "created_on": test_kingdom.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_kingdom(client, test_kingdom, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/kingdoms/{test_kingdom.kingdom_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert test_db.query(Kingdom).all() == []


def test_delete_kingdom_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/kingdoms/4321", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_kingdom(client, test_kingdom, test_superuser, superuser_token_headers):
    new_kingdom = {
        "kingdom_name": "Test Kingdom2",
        "kingdom_desc": "Kingdom2",
        "updated_by": test_superuser.user_id,
        "updated_on": test_kingdom.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_kingdom.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/kingdoms/{test_kingdom.kingdom_id}",
        json=new_kingdom,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_kingdom["kingdom_id"] = test_kingdom.kingdom_id
    new_kingdom["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_kingdom


def test_edit_kingdom_not_found(
    client, test_db, test_kingdom, test_superuser, superuser_token_headers
):
    new_kingdom = {
        "kingdom_name": "Test Kingdom2",
        "kingdom_desc": "Kingdom2",
        "updated_by": test_superuser.user_id,
        "updated_on": test_kingdom.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_kingdom.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/kingdoms/1234", json=new_kingdom, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_kingdom(
    client,
    test_kingdom,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/kingdoms/{test_kingdom.kingdom_id}", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "kingdom_id": test_kingdom.kingdom_id,
        "kingdom_name": test_kingdom.kingdom_name,
        "kingdom_desc": test_kingdom.kingdom_desc,
        "updated_by": test_kingdom.updated_by,
        "updated_on": test_kingdom.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_kingdom.created_by,
        "created_on": test_kingdom.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_kingdom_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/kingdoms/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
