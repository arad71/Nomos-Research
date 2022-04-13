from app.db.vernacular.model import Vernacular


def test_get_vernaculars(client, test_vernacular, superuser_token_headers):
    response = client.get("/api/v1/vernaculars", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "vernacular_id": test_vernacular.vernacular_id,
            "taxon_name_id": test_vernacular.taxon_name_id,
            "taxon_name": response.json()[0]["taxon_name"],
            "vernacular": test_vernacular.vernacular,
            "language": test_vernacular.language.value,
            "enabled": test_vernacular.enabled,
            "updated_by": test_vernacular.updated_by,
            "updated_on": test_vernacular.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_vernacular.created_by,
            "created_on": test_vernacular.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_vernacular(client, test_vernacular, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(Vernacular).all() == []


def test_delete_vernacular_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/vernaculars/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_vernacular(
    client, test_vernacular, test_superuser, superuser_token_headers
):
    new_vernacular = {
        "taxon_name_id": test_vernacular.taxon_name_id,
        "vernacular": "Vernacular 2",
        "language": "english",
        "enabled": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_vernacular.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_vernacular.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        json=new_vernacular,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_vernacular["vernacular_id"] = test_vernacular.vernacular_id
    new_vernacular["taxon_name"] = response.json()["taxon_name"]
    new_vernacular["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_vernacular


def test_edit_vernacular_not_found(
    client, test_db, test_vernacular, test_superuser, superuser_token_headers
):
    new_vernacular = {
        "taxon_name_id": test_vernacular.taxon_name_id,
        "vernacular": "Vernacular 2",
        "language": "english",
        "enabled": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_vernacular.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_vernacular.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/vernaculars/1234", json=new_vernacular, headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_get_vernacular(
    client,
    test_vernacular,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/vernaculars/{test_vernacular.vernacular_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "vernacular_id": test_vernacular.vernacular_id,
        "taxon_name_id": test_vernacular.taxon_name_id,
        "taxon_name": response.json()["taxon_name"],
        "vernacular": test_vernacular.vernacular,
        "language": test_vernacular.language.value,
        "enabled": test_vernacular.enabled,
        "updated_by": test_vernacular.updated_by,
        "updated_on": test_vernacular.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_vernacular.created_by,
        "created_on": test_vernacular.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_vernacular_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/vernaculars/123", headers=superuser_token_headers)
    assert response.status_code == 404
