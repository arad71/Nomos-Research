import pytest

from app.db.user import model


def test_get_users(client, test_superuser, test_user, superuser_token_headers):
    response = client.get("/api/v1/users", headers=superuser_token_headers)
    assert response.status_code == 200
    response_list = response.json()
    # We don't need to compare the role here
    for user in response_list:
        user.pop("user_role")
        user.pop("role_names")
        user.pop("role_ids")
        user.pop("created_on")
        user.pop("updated_on")
    assert len(response_list) == 2
    assert response_list[1] == {
        "user_id": test_superuser.user_id,
        "email": test_superuser.email,
        "is_active": test_superuser.is_active,
        "full_name": test_superuser.email,
        "created_by": test_user.user_id,
        "updated_by": test_user.user_id,
    }


def test_filter_users(
    client, test_superuser, test_app_support, superuser_token_headers
):
    response = client.get(
        '/api/v1/users?filter={"active":true}', headers=superuser_token_headers
    )
    assert response.status_code == 422
    response = client.get(
        '/api/v1/users?filter={"is_active":true}', headers=superuser_token_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 3
    response = client.get(
        '/api/v1/users?filter={"is_active":false}', headers=superuser_token_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 0

    response = client.get(
        '/api/v1/users?filter={"user_role___role___name":"SUPER_ADMIN"}',
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == test_superuser.email
    response = client.get(
        '/api/v1/users?filter={"user_role___role___name":"APPLICATION_SUPPORT"}',
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == test_app_support.email


def test_delete_user(client, test_superuser, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/users/{test_superuser.user_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    # assert test_db.query(model.User).all() == []


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
    assert response.status_code == 200
    new_user["user_id"] = test_superuser.user_id
    new_user["full_name"] = "Joe Smith"
    new_user["created_by"] = test_user.user_id
    new_user["updated_by"] = test_superuser.user_id
    new_user.pop("password")
    response_json = response.json()
    response_json.pop("user_role")
    response_json.pop("role_names")
    response_json.pop("role_ids")
    response_json.pop("updated_on")
    response_json.pop("created_on")
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
    assert response.status_code == 404


def test_get_user(
    client,
    test_user,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/users/{test_user.user_id}", headers=superuser_token_headers
    )
    assert response.status_code == 200
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
    assert response.status_code == 404


def test_authenticated_user_me(client, user_token_headers):
    response = client.get("/api/v1/users/me", headers=user_token_headers)
    assert response.status_code == 200


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    response = client.get("/api/v1/users")
    assert response.status_code == 401
    response = client.get("/api/v1/users/123")
    assert response.status_code == 401
    response = client.put("/api/v1/users/123")
    assert response.status_code == 401
    response = client.delete("/api/v1/users/123")
    assert response.status_code == 401


def test_unauthorized_routes(client, user_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "first_name": "Joe",
        "last_name": "Smith",
        "password": "new_password",
    }
    response = client.post("/api/v1/users", json=new_user, headers=user_token_headers)
    assert response.status_code == 403
    response = client.put("/api/v1/users/1", json=new_user, headers=user_token_headers)
    assert response.status_code == 403
    response = client.delete("/api/v1/users/123", headers=user_token_headers)
    assert response.status_code == 403


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", 200),
        ("get", "/api/v1/users/me", 200),
        ("put", "/api/v1/users/1", 403),
        ("delete", "/api/v1/users/1", 403),
        ("post", "/api/v1/users", 403),
    ],
)
def test_reader_permissions(client, reader_token_headers, method, endpoint, status):
    response = getattr(client, method)(endpoint, headers=reader_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", 200),
        ("get", "/api/v1/users/me", 200),
        ("put", "/api/v1/users/1", 403),
        ("delete", "/api/v1/users/1", 403),
        ("post", "/api/v1/users", 403),
    ],
)
def test_manager_permissions(client, manager_token_headers, method, endpoint, status):
    response = getattr(client, method)(endpoint, headers=manager_token_headers)
    assert response.status_code == status


@pytest.mark.parametrize(
    "method,endpoint,status",
    [
        ("get", "/api/v1/users", 200),
        ("get", "/api/v1/users/me", 200),
        ("put", "/api/v1/users/1", 422),
        ("delete", "/api/v1/users/1", 404),
        ("post", "/api/v1/users", 422),
    ],
)
def test_app_support_permissions(
    client, app_support_token_headers, method, endpoint, status
):
    response = getattr(client, method)(endpoint, headers=app_support_token_headers)
    assert response.status_code == status
