from app.db.publication.model import Publication


def test_get_publications(client, test_publication, superuser_token_headers):
    response = client.get("/api/v1/publications", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "publication_id": test_publication.publication_id,
            "bad_publication": test_publication.bad_publication,
            "publication": test_publication.publication,
            "publication_name": test_publication.publication_name,
            "author": [],
            "updated_by": test_publication.updated_by,
            "updated_on": test_publication.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_publication.created_by,
            "created_on": test_publication.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_publication(client, test_publication, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(Publication).all() == []


def test_delete_publication_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/publications/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_publication(
    client, test_publication, test_superuser, superuser_token_headers
):
    new_publication = {
        "bad_publication": test_publication.bad_publication,
        "publication": test_publication.publication,
        "publication_name": test_publication.publication_name,
        "updated_by": test_superuser.user_id,
        "updated_on": test_publication.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_publication.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/publications/{test_publication.publication_id}",
        json=new_publication,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_publication["publication_id"] = test_publication.publication_id
    new_publication["updated_on"] = response.json()["updated_on"]
    new_publication["author"] = []
    assert response.json() == new_publication


def test_edit_publication_not_found(
    client, test_db, test_publication, test_superuser, superuser_token_headers
):
    new_publication = {
        "bad_publication": True,
        "publication": "PUBLICATION 2",
        "publication_name": "PUBLICATION_NAME",
        "updated_by": test_superuser.user_id,
        "updated_on": test_publication.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_publication.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/publications/1234",
        json=new_publication,
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_get_publication(
    client,
    test_publication,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "publication_id": test_publication.publication_id,
        "bad_publication": test_publication.bad_publication,
        "publication": test_publication.publication,
        "publication_name": test_publication.publication_name,
        "author": [],
        "updated_by": test_publication.updated_by,
        "updated_on": test_publication.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_publication.created_by,
        "created_on": test_publication.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_publication_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/publications/123", headers=superuser_token_headers)
    assert response.status_code == 404
