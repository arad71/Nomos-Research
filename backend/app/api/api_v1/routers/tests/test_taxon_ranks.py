import app.db.taxon_rank.enums
from app.db.taxon_rank.model import TaxonRank


def test_get_taxon_ranks(client, test_taxon_rank, superuser_token_headers):
    response = client.get("/api/v1/taxon_ranks", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "taxon_rank_id": test_taxon_rank.taxon_rank_id,
            "kingdom_id": test_taxon_rank.kingdom_id,
            "rank_name": test_taxon_rank.rank_name,
            "rank_abbrev": test_taxon_rank.rank_abbrev.value,
            "uninomial": test_taxon_rank.uninomial,
            "updated_by": test_taxon_rank.updated_by,
            "updated_on": test_taxon_rank.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_taxon_rank.created_by,
            "created_on": test_taxon_rank.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_taxon_rank(client, test_taxon_rank, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(TaxonRank).all() == []


def test_delete_taxon_rank_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/taxon_ranks/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_taxon_rank(
    client, test_taxon_rank, test_kingdom, test_superuser, superuser_token_headers
):
    new_taxon_rank = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_name": "Rank Name 2",
        "rank_abbrev": app.db.taxon_rank.enums.RankAbbreviation.subvar,
        "uninomial": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_rank.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_rank.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        json=new_taxon_rank,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_taxon_rank["taxon_rank_id"] = test_taxon_rank.taxon_rank_id
    new_taxon_rank["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_taxon_rank


def test_edit_taxon_rank_not_found(
    client,
    test_db,
    test_taxon_rank,
    test_kingdom,
    test_superuser,
    superuser_token_headers,
):
    new_taxon_rank = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_name": "Rank Name 2",
        "rank_abbrev": "subvar",
        "uninomial": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_rank.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_rank.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/taxon_ranks/1234", json=new_taxon_rank, headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_get_taxon_rank(
    client,
    test_taxon_rank,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "taxon_rank_id": test_taxon_rank.taxon_rank_id,
        "kingdom_id": test_taxon_rank.kingdom_id,
        "rank_name": test_taxon_rank.rank_name,
        "rank_abbrev": test_taxon_rank.rank_abbrev.value,
        "uninomial": test_taxon_rank.uninomial,
        "updated_by": test_taxon_rank.updated_by,
        "updated_on": test_taxon_rank.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_taxon_rank.created_by,
        "created_on": test_taxon_rank.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_taxon_rank_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/taxon_ranks/123", headers=superuser_token_headers)
    assert response.status_code == 404
