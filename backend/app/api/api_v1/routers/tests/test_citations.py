from app.db.citation.model import Citation


def test_get_citations(client, test_citation, superuser_token_headers):
    response = client.get("/api/v1/citations", headers=superuser_token_headers)
    assert response.status_code == 200
    response_json = response.json()[0]
    assert response.json() == [
        {
            "citation_id": test_citation.citation_id,
            "taxon_name_id": test_citation.taxon_name_id,
            "author_id": test_citation.author_id,
            "author": response_json["author"],
            "author_type": test_citation.author_type.value,
            "author_order": test_citation.author_order,
            "updated_by": test_citation.updated_by,
            "updated_on": test_citation.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_citation.created_by,
            "created_on": test_citation.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_citation(client, test_citation, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(Citation).all() == []


def test_delete_citation_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/citations/4321", headers=superuser_token_headers)
    assert response.status_code == 404


def test_edit_citation(
    client,
    test_citation,
    test_author,
    test_taxon_name,
    test_superuser,
    superuser_token_headers,
):
    new_citation = {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "author_id": test_author.author_id,
        "author_type": "current",
        "author_order": 0,
        "updated_by": test_superuser.user_id,
        "updated_on": test_citation.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_citation.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/citations/{test_citation.citation_id}",
        json=new_citation,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_citation["citation_id"] = test_citation.citation_id
    new_citation["updated_on"] = response.json()["updated_on"]
    new_citation["author"] = response.json()["author"]
    assert response.json() == new_citation


def test_edit_citation_not_found(
    client, test_db, test_citation, test_superuser, superuser_token_headers
):
    new_citation = {
        "citation_id": test_citation.citation_id,
        "taxon_name_id": test_citation.taxon_name_id,
        "author_id": test_citation.author_id,
        "author_type": "current",
        "author_order": 0,
        "updated_by": test_superuser.user_id,
        "updated_on": test_citation.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_citation.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/citations/1234", json=new_citation, headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_get_citation(
    client,
    test_citation,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "citation_id": test_citation.citation_id,
        "taxon_name_id": test_citation.taxon_name_id,
        "author_id": test_citation.author_id,
        "author": response.json()["author"],
        "author_type": test_citation.author_type,
        "author_order": test_citation.author_order,
        "updated_by": test_citation.updated_by,
        "updated_on": test_citation.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_citation.created_by,
        "created_on": test_citation.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_citation_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/citations/123", headers=superuser_token_headers)
    assert response.status_code == 404
