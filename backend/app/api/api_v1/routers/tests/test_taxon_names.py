from app.db.taxon_name.model import TaxonName


def test_get_taxon_names(
    client, test_taxon_name, test_kingdom, test_taxon_rank, superuser_token_headers
):
    response = client.get("/api/v1/taxon_names", headers=superuser_token_headers)
    assert response.status_code == 200
    response_json = response.json()[0]
    assert response.json() == [
        {
            "taxon_name_id": test_taxon_name.taxon_name_id,
            "kingdom_id": test_kingdom.kingdom_id,
            "kingdom": response_json["kingdom"],
            "rank_id": test_taxon_rank.taxon_rank_id,
            "taxon_rank": response_json["taxon_rank"],
            "is_current": True,
            "validated": True,
            "canonical_name": test_taxon_name.canonical_name,
            "updated_by": test_taxon_name.updated_by,
            "updated_on": test_taxon_name.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_taxon_name.created_by,
            "created_on": test_taxon_name.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_taxon_name(client, test_taxon_name, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(TaxonName).all() == []


def test_delete_taxon_name_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/taxon_names/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_taxon_name(
    client,
    test_taxon_name,
    test_kingdom,
    test_taxon_rank,
    test_superuser,
    superuser_token_headers,
):
    new_taxon_name = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": test_taxon_name.is_current,
        "validated": test_taxon_name.validated,
        "canonical_name": test_taxon_name.canonical_name,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_name.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_name.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        json=new_taxon_name,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_taxon_name["taxon_name_id"] = test_taxon_name.taxon_name_id
    new_taxon_name["updated_on"] = response.json()["updated_on"]
    new_taxon_name["kingdom"] = response.json()["kingdom"]
    new_taxon_name["taxon_rank"] = response.json()["taxon_rank"]
    assert response.json() == new_taxon_name


def test_edit_taxon_name_not_found(
    client,
    test_db,
    test_taxon_name,
    test_kingdom,
    test_taxon_rank,
    test_superuser,
    superuser_token_headers,
):
    new_taxon_name = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "rank_name": "Rank Name",
        "is_current": True,
        "validated": True,
        "canonical_name": test_taxon_name.canonical_name,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_name.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_name.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/taxon_names/1234", json=new_taxon_name, headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_get_taxon_name(
    client,
    test_taxon_name,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "kingdom_id": test_taxon_name.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name.is_current,
        "validated": test_taxon_name.validated,
        "canonical_name": test_taxon_name.canonical_name,
        "updated_by": test_taxon_name.updated_by,
        "updated_on": test_taxon_name.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_taxon_name.created_by,
        "created_on": test_taxon_name.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_canonical_name_1(
    client,
    test_taxon_name_canonical_name_1,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name_canonical_name_1.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_1.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_1.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_1.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_1.is_current,
        "validated": test_taxon_name_canonical_name_1.validated,
        "genus": test_taxon_name_canonical_name_1.genus,
        'canonical_name': test_taxon_name_canonical_name_1.canonical_name,
        "updated_by": test_taxon_name_canonical_name_1.updated_by,
        "updated_on": test_taxon_name_canonical_name_1.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_taxon_name_canonical_name_1.created_by,
        "created_on": test_taxon_name_canonical_name_1.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_canonical_name_2(
    client,
    test_taxon_name_canonical_name_2,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name_canonical_name_2.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_2.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_2.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_2.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_2.is_current,
        "validated": test_taxon_name_canonical_name_2.validated,
        "genus": test_taxon_name_canonical_name_2.genus,
        "specific_epithet": test_taxon_name_canonical_name_2.specific_epithet,
        'canonical_name': test_taxon_name_canonical_name_2.canonical_name,
        "updated_by": test_taxon_name_canonical_name_2.updated_by,
        "updated_on": test_taxon_name_canonical_name_2.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_taxon_name_canonical_name_2.created_by,
        "created_on": test_taxon_name_canonical_name_2.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_canonical_name_3(
    client,
    test_taxon_name_canonical_name_3,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name_canonical_name_3.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_3.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_3.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_3.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_3.is_current,
        "validated": test_taxon_name_canonical_name_3.validated,
        "genus": test_taxon_name_canonical_name_3.genus,
        "specific_epithet": test_taxon_name_canonical_name_3.specific_epithet,
        "infraspecific_epithet": test_taxon_name_canonical_name_3.infraspecific_epithet,
        'canonical_name': test_taxon_name_canonical_name_3.canonical_name,
        "updated_by": test_taxon_name_canonical_name_3.updated_by,
        "updated_on": test_taxon_name_canonical_name_3.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_taxon_name_canonical_name_3.created_by,
        "created_on": test_taxon_name_canonical_name_3.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_taxon_name_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/taxon_names/123", headers=superuser_token_headers)
    assert response.status_code == 404
