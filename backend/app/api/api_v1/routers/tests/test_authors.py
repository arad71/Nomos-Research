import pytest
from starlette import status

from app.db.author.model import Author


def test_get_authors(client, test_author, superuser_token_headers):
    response = client.get("/api/v1/authors", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "author_id": test_author.author_id,
            "abbreviation": test_author.abbreviation,
            "surname": test_author.surname,
            "first_names": test_author.first_names,
            "initials": test_author.initials,
            "updated_by": test_author.updated_by,
            "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_author.created_by,
            "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_author(client, test_author, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/authors/{test_author.author_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert test_db.query(Author).all() == []


def test_delete_author_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/authors/4321", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_author(client, test_author, test_superuser, superuser_token_headers):
    new_author = {
        "abbreviation": "Test Author2",
        "surname": "Author2",
        "first_names": "Test",
        "initials": "TA2",
        "updated_by": test_superuser.user_id,
        "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/authors/{test_author.author_id}",
        json=new_author,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_author["author_id"] = test_author.author_id
    new_author["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_author


def test_edit_author_not_found(
    client, test_db, test_author, test_superuser, superuser_token_headers
):
    new_author = {
        "abbreviation": "Test Author2",
        "surname": "Author2",
        "first_names": "Test",
        "initials": "TA2",
        "updated_by": test_superuser.user_id,
        "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/authors/1234", json=new_author, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_author(
    client,
    test_author,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/authors/{test_author.author_id}", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "author_id": test_author.author_id,
        "abbreviation": test_author.abbreviation,
        "surname": test_author.surname,
        "first_names": test_author.first_names,
        "initials": test_author.initials,
        "updated_by": test_author.updated_by,
        "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_author.created_by,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_author_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/authors/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/authors")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/authors/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/authors/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/authors/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_author,
    test_superuser,
):
    response = client.get("/api/v1/authors", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/authors/{test_author.author_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    author_json = {
        "abbreviation": "Another Author",
        "surname": "Author",
        "first_names": "Another",
        "initials": "AA",
        "created_by": test_superuser.user_id,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.post(
        "/api/v1/authors", headers=superuser_token_headers, json=author_json
    )
    assert response.status_code == status.HTTP_200_OK

    author_json = {
        "first_names": "Yet Another",
        "abbreviation": "Yet Another Author",
        "initials": "YAA",
        "updated_by": test_superuser.user_id,
        "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/authors/{test_author.author_id}",
        headers=superuser_token_headers,
        json=author_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/authors/{test_author.author_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_author,
    test_manager,
):
    response = client.get("/api/v1/authors", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/authors/{test_author.author_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    author_json = {
        "abbreviation": "Another Author",
        "surname": "Author",
        "first_names": "Another",
        "initials": "AA",
        "created_by": test_manager.user_id,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.post(
        "/api/v1/authors", headers=manager_token_headers, json=author_json
    )
    assert response.status_code == status.HTTP_200_OK

    author_json = {
        "abbreviation": "Yet Another Author",
        "first_names": "Yet Another",
        "initials": "YAA",
        "updated_by": test_manager.user_id,
        "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        f"/api/v1/authors/{test_author.author_id}",
        headers=manager_token_headers,
        json=author_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/authors/{test_author.author_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_author,
    test_officer,
):
    response = client.get("/api/v1/authors", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/authors/{test_author.author_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/authors/{test_author.author_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    author_json = {
        "abbreviation": "Another Author",
        "surname": "Author",
        "first_names": "Another",
        "initials": "AA",
        "created_by": test_officer.user_id,
        "created_on": test_author.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.post(
        "/api/v1/authors", headers=officer_token_headers, json=author_json
    )
    assert response.status_code == status.HTTP_200_OK

    author_json.update(
        {
            "abbreviation": "Tet Another Author",
            "first_names": "Yet Another",
            "initials": "YAA",
            "updated_by": test_officer.user_id,
            "updated_on": test_author.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    )
    response = client.put(
        f"/api/v1/authors/{test_author.author_id}",
        headers=officer_token_headers,
        json=author_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/authors", status.HTTP_200_OK),
    ("post", "/api/v1/authors", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/authors/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/authors/1", status.HTTP_403_FORBIDDEN),
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
