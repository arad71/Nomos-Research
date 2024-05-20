import pytest
from starlette import status

from app.db.conservation_code.model import Conservationcode


def test_get_conservation_codes(
    client, test_conservation_code, superuser_token_headers
):
    response = client.get("/api/v1/conservation_codes", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [{
        "conservation_code_id": test_conservation_code.conservation_code_id,
        "conservation_code_value": test_conservation_code.conservation_code_value,
        "authorising_org": test_conservation_code.authorising_org,
        "code_priority": test_conservation_code.code_priority,
        "updated_by": test_conservation_code.updated_by,
        "updated_on": test_conservation_code.updated_on.isoformat(),
        "created_by": test_conservation_code.created_by,
        "created_on": test_conservation_code.created_on.isoformat(),
        "deleted": False,
    }]


def test_delete_conservation_codes(
    client, test_conservation_code, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(Conservationcode).all() == [test_conservation_code]


def test_hard_delete_conservation_codes(
    client, test_conservation_code, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}/hard",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "conservation_code_id": test_conservation_code.conservation_code_id
    }
    assert test_db.query(Conservationcode).all() == []


def test_delete_conservation_codes_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/conservation_codes/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_conservation_codes(
    client, test_conservation_code, test_superuser, superuser_token_headers
):
    new_conservation_code = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "101",
        "updated_by": test_superuser.user_id,
        "updated_on": test_conservation_code.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_conservation_code.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        json=new_conservation_code,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_conservation_code["conservation_code_id"] = (
        test_conservation_code.conservation_code_id
    )
    new_conservation_code["authorising_org"] = test_conservation_code.authorising_org
    new_conservation_code["updated_on"] = response.json()["updated_on"]
    new_conservation_code["deleted"] = False
    assert response.json() == new_conservation_code


def test_edit_conservation_codes_not_found(
    client, test_db, test_conservation_code, test_superuser, superuser_token_headers
):
    new_conservation_code = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "101",
        "updated_by": test_superuser.user_id,
        "updated_on": test_conservation_code.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_conservation_code.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/conservation_codes/1234",
        json=new_conservation_code,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_conservation_codes(
    client,
    test_conservation_code,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "conservation_code_id": test_conservation_code.conservation_code_id,
        "conservation_code_value": test_conservation_code.conservation_code_value,
        "authorising_org": test_conservation_code.authorising_org,
        "code_priority": test_conservation_code.code_priority,
        "updated_by": test_conservation_code.updated_by,
        "updated_on": test_conservation_code.updated_on.isoformat(),
        "created_by": test_conservation_code.created_by,
        "created_on": test_conservation_code.created_on.isoformat(),
        "deleted": False,
    }


def test_conservation_codes_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/conservation_codes/123", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/conservation_codes")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/conservation_codes/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/conservation_codes/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/conservation_codes/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_conservation_code,
    test_superuser,
):
    response = client.get("/api/v1/conservation_codes", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    conservation_code_json = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "created_by": test_superuser.user_id,
        "created_on": test_conservation_code.created_on.isoformat(),
    }

    response = client.post(
        "/api/v1/conservation_codes",
        headers=superuser_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK

    conservation_code_json = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "updated_by": test_superuser.user_id,
        "updated_on": test_conservation_code.updated_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=superuser_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_conservation_code,
    test_manager,
):
    response = client.get("/api/v1/conservation_codes", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    conservation_code_json = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "created_by": test_manager.user_id,
        "created_on": test_conservation_code.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/conservation_codes",
        headers=manager_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK

    conservation_code_json = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "updated_by": test_manager.user_id,
        "updated_on": test_conservation_code.updated_on.isoformat(),
    }
    response = client.put(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=manager_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_conservation_code,
    test_officer,
):
    response = client.get("/api/v1/conservation_codes", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    conservation_code_json = {
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "created_by": test_officer.user_id,
        "created_on": test_conservation_code.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/conservation_codes",
        headers=officer_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK

    conservation_code_json.update({
        "conservation_code_value": "P1",
        "authorising_org": "Federal",
        "code_priority": "102",
        "updated_by": test_officer.user_id,
        "updated_on": test_conservation_code.updated_on.isoformat(),
    })
    response = client.put(
        f"/api/v1/conservation_codes/{test_conservation_code.conservation_code_id}",
        headers=officer_token_headers,
        json=conservation_code_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/conservation_codes", status.HTTP_200_OK),
    ("post", "/api/v1/conservation_codes", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/conservation_codes/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/conservation_codes/1", status.HTTP_403_FORBIDDEN),
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
