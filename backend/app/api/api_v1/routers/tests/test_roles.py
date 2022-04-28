import pytest
from starlette import status


def test_get_roles(
    client,
    test_superuser,
    test_app_support,
    test_manager,
    test_officer,
    test_reader,
    reader_token_headers,
):
    response = client.get("/api/v1/roles", headers=reader_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response_list = response.json()
    assert len(response_list) == 5


def test_cannot_delete_role(client, test_role, superuser_token_headers):
    response = client.delete(
        f"/api/v1/roles/{test_role.role_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_cannot_edit_role(client, test_role, superuser_token_headers):
    response = client.put(
        f"/api/v1/roles/{test_role.role_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_cannot_create_role(client, test_superuser, superuser_token_headers):
    response = client.post(
        f"/api/v1/roles",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    response_list = response.json()


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/roles")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/roles/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/roles/123")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    response = client.delete("/api/v1/roles/123")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_unauthorized_routes(client, user_token_headers):
    new_role = {
        "name": "test_role",
        "description": "test_role_description",
    }
    response = client.post("/api/v1/roles", json=new_role, headers=user_token_headers)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    response = client.put("/api/v1/roles/1", json=new_role, headers=user_token_headers)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    response = client.delete("/api/v1/roles/123", headers=user_token_headers)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


parameter_names = "method,endpoint,status"

parameter_values = [
    ("get", "/api/v1/roles", status.HTTP_200_OK),
    ("put", "/api/v1/roles/1", status.HTTP_405_METHOD_NOT_ALLOWED),
    ("delete", "/api/v1/roles/1", status.HTTP_405_METHOD_NOT_ALLOWED),
    ("post", "/api/v1/roles", status.HTTP_405_METHOD_NOT_ALLOWED),
]


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_reader_permissions(
    client, test_role, reader_token_headers, method, endpoint, status
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


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_app_support_permissions(
    client, test_role, app_support_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=app_support_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_super_admin_permissions(
    client, test_role, superuser_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=superuser_token_headers)
    assert response.status_code == status
