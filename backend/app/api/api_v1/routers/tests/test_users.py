from app.db import models


def test_get_users(client, test_superuser, superuser_token_headers):
    response = client.get("/api/v1/users", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "user_id": test_superuser.user_id,
            "email": test_superuser.email,
            "is_active": test_superuser.is_active,
            "is_superuser": test_superuser.is_superuser,
        }
    ]


def test_delete_user(client, test_superuser, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/users/{test_superuser.user_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(models.User).all() == []


def test_delete_user_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/users/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_user(client, test_superuser, superuser_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "is_superuser": True,
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
    new_user.pop("password")
    assert response.json() == new_user


def test_edit_user_not_found(client, test_db, superuser_token_headers):
    new_user = {
        "email": "newemail@email.com",
        "is_active": False,
        "is_superuser": False,
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
    assert response.json() == {
        "user_id": test_user.user_id,
        "email": test_user.email,
        "is_active": bool(test_user.is_active),
        "is_superuser": test_user.is_superuser,
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
    response = client.get("/api/v1/users", headers=user_token_headers)
    assert response.status_code == 403
    response = client.get("/api/v1/users/123", headers=user_token_headers)
    assert response.status_code == 403
