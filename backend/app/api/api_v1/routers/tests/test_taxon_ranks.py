import pytest
from starlette import status

import app.db.taxon_rank.enums
from app.db.taxon_rank.model import TaxonRank


def test_get_taxon_ranks(
    client, test_taxon_rank, test_kingdom, superuser_token_headers
):
    response = client.get("/api/v1/taxon_ranks", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "taxon_rank_id": test_taxon_rank.taxon_rank_id,
            "kingdom_id": test_taxon_rank.kingdom_id,
            "rank_name": test_taxon_rank.rank_name,
            "rank_abbrev": test_taxon_rank.rank_abbrev.value,
            "uninomial": test_taxon_rank.uninomial,
            "updated_by": test_taxon_rank.updated_by,
            "updated_on": test_taxon_rank.updated_on.isoformat(),
            "created_by": test_taxon_rank.created_by,
            "kingdom_name": test_kingdom.kingdom_name,
            "created_on": test_taxon_rank.created_on.isoformat(),
        }
    ]


def test_delete_taxon_rank(client, test_taxon_rank, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert test_db.query(TaxonRank).all() == []


def test_delete_taxon_rank_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/taxon_ranks/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_taxon_rank(
    client, test_taxon_rank, test_kingdom, test_superuser, superuser_token_headers
):
    new_taxon_rank = {
        "kingdom_id": test_kingdom.kingdom_id,
        "kingdom_name": test_kingdom.kingdom_name,
        "rank_name": "Rank Name 2",
        "rank_abbrev": app.db.taxon_rank.enums.RankAbbreviation.subvar,
        "uninomial": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_rank.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_rank.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        json=new_taxon_rank,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
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
        "updated_on": test_taxon_rank.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_rank.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/taxon_ranks/1234", json=new_taxon_rank, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_taxon_rank(
    client,
    test_taxon_rank,
    test_kingdom,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "taxon_rank_id": test_taxon_rank.taxon_rank_id,
        "kingdom_id": test_taxon_rank.kingdom_id,
        "kingdom_name": test_kingdom.kingdom_name,
        "rank_name": test_taxon_rank.rank_name,
        "rank_abbrev": test_taxon_rank.rank_abbrev.value,
        "uninomial": test_taxon_rank.uninomial,
        "updated_by": test_taxon_rank.updated_by,
        "updated_on": test_taxon_rank.updated_on.isoformat(),
        "created_by": test_taxon_rank.created_by,
        "created_on": test_taxon_rank.created_on.isoformat(),
    }


def test_taxon_rank_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/taxon_ranks/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/taxon_ranks")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/taxon_ranks/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/taxon_ranks/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/taxon_ranks/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_app_support_permissions(
    client,
    app_support_token_headers,
    test_taxon_rank,
    test_kingdom,
    test_app_support,
):
    response = client.get("/api/v1/taxon_ranks", headers=app_support_token_headers)
    assert response.status_code == status.HTTP_200_OK
    taxon_rank_id = test_taxon_rank.taxon_rank_id
    response = client.get(
        f"/api/v1/taxon_ranks/{taxon_rank_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_name": "Rank Name 9",
        "rank_abbrev": "subvar",
        "uninomial": False,
        "created_by": test_app_support.user_id,
        "created_on": test_taxon_rank.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/taxon_ranks", headers=app_support_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
    taxon_rank_id = response.json()["taxon_rank_id"]

    json.update({"updated_by": test_app_support.user_id})
    response = client.put(
        f"/api/v1/taxon_ranks/{taxon_rank_id}",
        headers=app_support_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/taxon_ranks/{taxon_rank_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_taxon_rank,
    test_kingdom,
    test_superuser,
):
    response = client.get("/api/v1/taxon_ranks", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/taxon_ranks/{test_taxon_rank.taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_name": "Rank Name 9",
        "rank_abbrev": "subvar",
        "uninomial": False,
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_rank.created_on.isoformat(),
    }

    response = client.post(
        "/api/v1/taxon_ranks", headers=superuser_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_rank_id = response.json()["taxon_rank_id"]
    json.update({"rank_name": "Rank Name 91", "updated_by": test_superuser.user_id})

    response = client.put(
        f"/api/v1/taxon_ranks/{taxon_rank_id}",
        headers=superuser_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/taxon_ranks/{taxon_rank_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/taxon_ranks", status.HTTP_200_OK),
    ("post", "/api/v1/taxon_ranks", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/taxon_ranks/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/taxon_ranks/1", status.HTTP_403_FORBIDDEN),
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
def test_manager_permissions(
    client, manager_token_headers, method, endpoint, status_code
):
    response = getattr(client, method)(endpoint, headers=manager_token_headers)
    assert response.status_code == status_code


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_officer_permissions(
    client, officer_token_headers, method, endpoint, status_code
):
    response = getattr(client, method)(endpoint, headers=officer_token_headers)
    assert response.status_code == status_code
