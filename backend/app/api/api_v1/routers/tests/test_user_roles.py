import pytest
from starlette import status


def test_get_user_roles(
    client,
    reader_token_headers,
    test_reader,
):
    response = client.get("/api/v1/user_roles", headers=reader_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response_list = response.json()
    assert len(response_list) == 1


def test_get_user_role(client, test_user_role, reader_token_headers):
    response = client.get(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=reader_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response_item = response.json()
    assert response_item["user_id"] == test_user_role.user_id
    assert response_item["role_id"] == test_user_role.role_id


def test_create_user_role(client, app_support_token_headers, test_user, test_role):
    data = {
        "user_id": test_user.user_id,
        "role_id": test_role.role_id,
        "created_by": test_user.user_id,
        "updated_by": test_user.user_id,
    }
    response = client.post(
        f"/api/v1/user_roles", headers=app_support_token_headers, json=data
    )
    assert response.status_code == status.HTTP_200_OK
    response_item: dict = response.json()
    assert response_item["user_role_id"] is not None
    assert response_item["user_id"] == test_user.user_id
    assert response_item["role_id"] == test_role.role_id


def test_edit_user_role(
    client, superuser_token_headers, test_user_role, test_role2, test_user
):
    json = {"user_id": test_user.user_id, "role_id": test_role2.role_id}
    response = client.put(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        json=json,
        headers=superuser_token_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["role_id"] == test_role2.role_id


def test_delete_user_role(client, app_support_token_headers, test_user_role):
    response = client.delete(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/user_roles")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/user_roles/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/user_roles/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/user_roles/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_unauthorized_routes(client, user_token_headers):
    new_role = {
        "name": "test_role",
        "description": "test_role_description",
    }
    response = client.post(
        "/api/v1/user_roles", json=new_role, headers=user_token_headers
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    response = client.put(
        "/api/v1/user_roles/1", json=new_role, headers=user_token_headers
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    response = client.delete("/api/v1/user_roles/123", headers=user_token_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


parameter_names = "method,endpoint,status"

parameter_values = [
    ("get", "/api/v1/user_roles", status.HTTP_200_OK),
    ("put", "/api/v1/user_roles/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/user_roles/1", status.HTTP_403_FORBIDDEN),
    ("post", "/api/v1/user_roles", status.HTTP_403_FORBIDDEN),
]


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_reader_permissions(
    client, test_reader, reader_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=reader_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_officer_permissions(
    client, test_role, officer_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=officer_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_manager_permissions(
    client, test_role, manager_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=manager_token_headers)
    assert response.status_code == status


def test_app_support_permissions(
    client, test_role, app_support_token_headers, test_user_role, test_role2, test_user
):
    response = client.get("/api/v1/user_roles", headers=app_support_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response = client.get(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response = client.delete(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    json = {
        "user_id": test_user.user_id,
        "role_id": test_role.role_id,
    }
    response = client.post(
        "/api/v1/user_roles", headers=app_support_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
    user_role_id = response.json()["user_role_id"]

    json = {"user_id": test_user.user_id, "role_id": test_role2.role_id}
    response = client.put(
        f"/api/v1/user_roles/{user_role_id}",
        headers=app_support_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK


def test_super_admin_permissions(
    client, test_role, superuser_token_headers, test_user_role, test_role2, test_user
):
    response = client.get("/api/v1/user_roles", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response = client.get(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response = client.delete(
        f"/api/v1/user_roles/{test_user_role.user_role_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    json = {
        "user_id": test_user.user_id,
        "role_id": test_role.role_id,
    }
    response = client.post(
        "/api/v1/user_roles", headers=superuser_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
    user_role_id = response.json()["user_role_id"]

    json = {"user_id": test_user.user_id, "role_id": test_role2.role_id}
    response = client.put(
        f"/api/v1/user_roles/{user_role_id}", headers=superuser_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
