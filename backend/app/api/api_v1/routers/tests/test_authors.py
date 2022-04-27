from app.db.author.model import Author


def test_get_authors(client, test_author, superuser_token_headers):
    response = client.get("/api/v1/authors", headers=superuser_token_headers)
    assert response.status_code == 200
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
    assert response.status_code == 200
    assert test_db.query(Author).all() == []


def test_delete_author_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/authors/4321", headers=superuser_token_headers)
    assert response.status_code == 404


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
    assert response.status_code == 200
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
    assert response.status_code == 404


def test_get_author(
    client,
    test_author,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/authors/{test_author.author_id}", headers=superuser_token_headers
    )
    assert response.status_code == 200
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
    assert response.status_code == 404
