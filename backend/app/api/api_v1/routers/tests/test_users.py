import pytest
from starlette import status

from app.db.user import model


def test_get_users(client, test_superuser, test_user, superuser_token_headers):
    response = client.get("/api/v1/users", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response_list = response.json()
    # We don't need to compare the role here
    for user in response_list:
        user.pop("user_role")
        user.pop("role_names")
        user.pop("role_ids")
        user.pop("created_on")
        user.pop("updated_on")
    assert response_list[0] == {
        "user_id": test_superuser.user_id,
        "email": test_superuser.email,
        "is_active": test_superuser.is_active,
        "full_name": test_superuser.email,
    }


def test_filter_users(
    client, test_superuser, test_app_support, superuser_token_headers
):
    response = client.get(
        '/api/v1/users?filter={"active":true}', headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.get(
        '/api/v1/users?filter={"is_active":true}', headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 2
    response = client.get(
        '/api/v1/users?filter={"is_active":false}', headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0

    response = client.get(
        '/api/v1/users?filter={"user_role___role___name":"SUPER_ADMIN"}',
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == test_superuser.email
    response = client.get(
        '/api/v1/users?filter={"user_role___role___name":"APPLICATION_SUPPORT"}',
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == test_app_support.email


def test_delete_user(client, test_superuser, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/users/{test_superuser.user_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True


def test_delete_user_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/users/4321", headers=superuser_token_headers)
    assert response.status_code == 404


def test_edit_user(client, test_user, test_superuser, superuser_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "first_name": "Joe",
        "last_name": "Smith",
        "password": "new_password",
    }

    response = client.put(
        f"/api/v1/users/{test_superuser.user_id}",
        json=new_user,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_user["user_id"] = test_superuser.user_id
    new_user["full_name"] = "Joe Smith"
    new_user.pop("password")
    response_json = response.json()
    response_json.pop("user_role")
    response_json.pop("role_names")
    response_json.pop("role_ids")
    response_json.pop("updated_on")
    response_json.pop("created_on")
    response_json.pop("updated_by")
    # response_json.pop("created_by")
    assert response_json == new_user


def test_edit_user_not_found(client, test_db, superuser_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "password": "new_password",
    }
    response = client.put(
        "/api/v1/users/1234", json=new_user, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_user(
    client,
    test_user,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/users/{test_user.user_id}", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()
    response_json.pop("created_on")
    response_json.pop("updated_on")
    assert response_json == {
        "user_id": test_user.user_id,
        "email": test_user.email,
        "is_active": bool(test_user.is_active),
        "full_name": test_user.email,
        "user_role": [],
        "role_ids": [],
        "role_names": [],
    }


def test_user_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/users/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_authenticated_user_me(client, user_token_headers):
    response = client.get("/api/v1/users/me", headers=user_token_headers)
    assert response.status_code == status.HTTP_200_OK


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/users")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/users/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/users/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/users/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_unauthorized_routes(client, user_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "first_name": "Joe",
        "last_name": "Smith",
        "password": "new_password",
    }
    response = client.post("/api/v1/users", json=new_user, headers=user_token_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    response = client.put("/api/v1/users/1", json=new_user, headers=user_token_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    response = client.delete("/api/v1/users/123", headers=user_token_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", status.HTTP_200_OK),
        ("get", "/api/v1/users/me", status.HTTP_200_OK),
        ("put", "/api/v1/users/1", status.HTTP_403_FORBIDDEN),
        ("delete", "/api/v1/users/1", status.HTTP_403_FORBIDDEN),
        ("post", "/api/v1/users", status.HTTP_403_FORBIDDEN),
    ],
)
def test_reader_permissions(client, reader_token_headers, method, endpoint, status):
    response = getattr(client, method)(endpoint, headers=reader_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", status.HTTP_200_OK),
        ("get", "/api/v1/users/me", status.HTTP_200_OK),
        ("put", "/api/v1/users/1", status.HTTP_403_FORBIDDEN),
        ("delete", "/api/v1/users/1", status.HTTP_403_FORBIDDEN),
        ("post", "/api/v1/users", status.HTTP_403_FORBIDDEN),
    ],
)
def test_manager_permissions(client, manager_token_headers, method, endpoint, status):
    response = getattr(client, method)(endpoint, headers=manager_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", status.HTTP_200_OK),
        ("get", "/api/v1/users/me", status.HTTP_200_OK),
        ("put", "/api/v1/users/1", status.HTTP_422_UNPROCESSABLE_ENTITY),
        ("delete", "/api/v1/users/1", status.HTTP_404_NOT_FOUND),
        ("post", "/api/v1/users", status.HTTP_422_UNPROCESSABLE_ENTITY),
    ],
)
def test_app_support_permissions(
    client, app_support_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=app_support_token_headers)
    assert response.status_code == status
