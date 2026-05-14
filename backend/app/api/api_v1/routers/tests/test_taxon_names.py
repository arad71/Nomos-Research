import pytest
from starlette import status

from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.model import TaxonName


def test_get_taxon_names(
    client, test_taxon_name, test_kingdom, test_taxon_rank, superuser_token_headers
):
    response = client.get("/api/v1/taxon_names", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
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
            "is_autonym": False,
            "is_hybrid": False,
            "hybrid_category": None,
            "review": False,
            "canonical_name": test_taxon_name.canonical_name,
            "canonical_name_without_rank": test_taxon_name.canonical_name_without_rank,
            "updated_by": test_taxon_name.updated_by,
            "updated_on": test_taxon_name.updated_on.isoformat(),
            "created_by": test_taxon_name.created_by,
            "created_on": test_taxon_name.created_on.isoformat(),
            "classification_system_ids": [],
            "path": [],
            "scientific_name": "Testuninomial",
            "formatted_scientific_name": "<i>Testuninomial</i>",
            "has_cultivar": False,
            "uninomial": "Testuninomial",
            "deleted": False,
        }
    ]


def test_delete_taxon_name(
    client, test_taxon_name, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(TaxonName).all() == [test_taxon_name]
    assert TaxonNameCrud.get_items(test_db, test_superuser)[0] == []
    assert TaxonNameCrud.get_items(
        test_db, test_superuser, list_filter='{"deleted": true}'
    )[0] == [test_taxon_name]


def test_hard_delete_taxon_name(
    client, test_taxon_name, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}/hard",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"taxon_name_id": test_taxon_name.taxon_name_id}
    assert test_db.query(TaxonName).all() == []


def test_delete_taxon_name_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/taxon_names/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


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
        "is_autonym": True,
        "is_hybrid": True,
        "hybrid_category": "hybrid_formula",
        "canonical_name": test_taxon_name.canonical_name,
        "canonical_name_without_rank": test_taxon_name.canonical_name_without_rank,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_name.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_name.created_on.isoformat(),
        "classification_system_ids": [],
        "formatted_scientific_name": "<i>Testuninomial</i>",
        "path": [],
        "scientific_name": "Testuninomial",
        "uninomial": "Testuninomial",
        "review": True,
        "review_reason": "Test Review Reason",
    }

    response = client.put(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        json=new_taxon_name,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_taxon_name["taxon_name_id"] = test_taxon_name.taxon_name_id
    new_taxon_name["updated_on"] = response.json()["updated_on"]
    new_taxon_name["kingdom"] = response.json()["kingdom"]
    new_taxon_name["taxon_rank"] = response.json()["taxon_rank"]
    new_taxon_name["all_vernaculars"] = response.json()["all_vernaculars"]
    new_taxon_name["has_cultivar"] = False
    new_taxon_name["deleted"] = False
    assert response.json() == new_taxon_name


def test_create_hybrid_taxon_name_requires_category(
    client,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": True,
        "classification_system_ids": [],
    }

    response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_taxon_name_with_cultivar_epithet(
    client,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "classification_system_ids": [],
        "uninomial": "Callistemon",
        "cultivar_epithet": "  bluff   cream  ",
    }

    response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )

    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()
    assert response_json["cultivar_epithet"] == "bluff cream"
    assert response_json["has_cultivar"] is True
    assert response_json["canonical_name"] == "Callistemon \u2018Bluff Cream\u2019"
    assert response_json["canonical_name_without_rank"] == (
        "Callistemon \u2018Bluff Cream\u2019"
    )
    assert response_json["scientific_name"] == "Callistemon \u2018Bluff Cream\u2019"
    assert response_json["formatted_scientific_name"] == (
        "<i>Callistemon</i> \u2018Bluff Cream\u2019"
    )


def test_create_taxon_name_rejects_quoted_cultivar_epithet(
    client,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "classification_system_ids": [],
        "uninomial": "Callistemon",
        "cultivar_epithet": "'Bluff Cream'",
    }

    response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_filter_taxon_names_by_has_cultivar(
    client,
    test_taxon_name,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "classification_system_ids": [],
        "uninomial": "Leptospermum",
        "cultivar_epithet": "Bullatum",
    }
    create_response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )
    assert create_response.status_code == status.HTTP_200_OK
    cultivar_id = create_response.json()["taxon_name_id"]

    cultivar_response = client.get(
        "/api/v1/taxon_names",
        headers=superuser_token_headers,
        params={"filter": '{"has_cultivar":true}'},
    )
    non_cultivar_response = client.get(
        "/api/v1/taxon_names",
        headers=superuser_token_headers,
        params={"filter": '{"has_cultivar":false}'},
    )

    assert cultivar_response.status_code == status.HTTP_200_OK
    assert [row["taxon_name_id"] for row in cultivar_response.json()] == [cultivar_id]
    assert non_cultivar_response.status_code == status.HTTP_200_OK
    assert test_taxon_name.taxon_name_id in [
        row["taxon_name_id"] for row in non_cultivar_response.json()
    ]
    assert cultivar_id not in [
        row["taxon_name_id"] for row in non_cultivar_response.json()
    ]


def test_search_taxon_names_by_formatted_cultivar_name(
    client,
    test_kingdom,
    test_taxon_rank,
    superuser_token_headers,
):
    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "classification_system_ids": [],
        "uninomial": "Callistemon",
        "cultivar_epithet": "Bluff Cream",
    }
    create_response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )
    assert create_response.status_code == status.HTTP_200_OK
    cultivar_id = create_response.json()["taxon_name_id"]

    search_response = client.get(
        "/api/v1/taxon_names",
        headers=superuser_token_headers,
        params={"filter": '{"q":"Callistemon \'Bluff Cream\'"}'},
    )

    assert search_response.status_code == status.HTTP_200_OK
    assert [row["taxon_name_id"] for row in search_response.json()] == [cultivar_id]


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
        "updated_on": test_taxon_name.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_name.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/taxon_names/1234", json=new_taxon_name, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


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
    assert response.status_code == status.HTTP_200_OK

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "kingdom_id": test_taxon_name.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name.is_current,
        "is_autonym": False,
        "is_hybrid": False,
        "hybrid_category": None,
        "validated": test_taxon_name.validated,
        "canonical_name": test_taxon_name.canonical_name,
        "canonical_name_without_rank": test_taxon_name.canonical_name_without_rank,
        "updated_by": test_taxon_name.updated_by,
        "updated_on": test_taxon_name.updated_on.isoformat(),
        "created_by": test_taxon_name.created_by,
        "created_on": test_taxon_name.created_on.isoformat(),
        "classification_system_ids": [],
        "formatted_scientific_name": "<i>Testuninomial</i>",
        "has_cultivar": False,
        "path": [],
        "scientific_name": "Testuninomial",
        "uninomial": "Testuninomial",
        "deleted": False,
        "review": False,
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
    assert response.status_code == status.HTTP_200_OK

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_1.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_1.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_1.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_1.is_current,
        "validated": test_taxon_name_canonical_name_1.validated,
        "uninomial": test_taxon_name_canonical_name_1.uninomial,
        "canonical_name": test_taxon_name_canonical_name_1.canonical_name,
        "canonical_name_without_rank": (
            test_taxon_name_canonical_name_1.canonical_name_without_rank
        ),
        "scientific_name": test_taxon_name_canonical_name_1.scientific_name,
        "formatted_scientific_name": (
            test_taxon_name_canonical_name_1.formatted_scientific_name
        ),
        "has_cultivar": False,
        "is_autonym": False,
        "is_hybrid": False,
        "hybrid_category": None,
        "updated_by": test_taxon_name_canonical_name_1.updated_by,
        "updated_on": test_taxon_name_canonical_name_1.updated_on.isoformat(),
        "created_by": test_taxon_name_canonical_name_1.created_by,
        "created_on": test_taxon_name_canonical_name_1.created_on.isoformat(),
        "classification_system_ids": [],
        "path": [],
        "deleted": False,
        "review": False,
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
    assert response.status_code == status.HTTP_200_OK

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_2.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_2.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_2.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_2.is_current,
        "validated": test_taxon_name_canonical_name_2.validated,
        "specific_epithet": test_taxon_name_canonical_name_2.specific_epithet,
        "canonical_name": test_taxon_name_canonical_name_2.canonical_name,
        "canonical_name_without_rank": (
            test_taxon_name_canonical_name_2.canonical_name_without_rank
        ),
        "scientific_name": test_taxon_name_canonical_name_2.scientific_name,
        "formatted_scientific_name": (
            test_taxon_name_canonical_name_2.formatted_scientific_name
        ),
        "has_cultivar": False,
        "is_autonym": False,
        "is_hybrid": False,
        "hybrid_category": None,
        "updated_by": test_taxon_name_canonical_name_2.updated_by,
        "updated_on": test_taxon_name_canonical_name_2.updated_on.isoformat(),
        "created_by": test_taxon_name_canonical_name_2.created_by,
        "created_on": test_taxon_name_canonical_name_2.created_on.isoformat(),
        "classification_system_ids": [],
        "path": [],
        "uninomial": "Acanthiza",
        "deleted": False,
        "review": False,
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
    assert response.status_code == status.HTTP_200_OK

    response_json = response.json()
    assert response.json() == {
        "taxon_name_id": test_taxon_name_canonical_name_3.taxon_name_id,
        "kingdom_id": test_taxon_name_canonical_name_3.kingdom_id,
        "kingdom": response_json["kingdom"],
        "rank_id": test_taxon_name_canonical_name_3.rank_id,
        "taxon_rank": response_json["taxon_rank"],
        "is_current": test_taxon_name_canonical_name_3.is_current,
        "validated": test_taxon_name_canonical_name_3.validated,
        "uninomial": test_taxon_name_canonical_name_3.uninomial,
        "specific_epithet": test_taxon_name_canonical_name_3.specific_epithet,
        "infraspecific_epithet": test_taxon_name_canonical_name_3.infraspecific_epithet,
        "canonical_name": test_taxon_name_canonical_name_3.canonical_name,
        "canonical_name_without_rank": (
            test_taxon_name_canonical_name_3.canonical_name_without_rank
        ),
        "scientific_name": test_taxon_name_canonical_name_3.scientific_name,
        "formatted_scientific_name": (
            test_taxon_name_canonical_name_3.formatted_scientific_name
        ),
        "has_cultivar": False,
        "updated_by": test_taxon_name_canonical_name_3.updated_by,
        "updated_on": test_taxon_name_canonical_name_3.updated_on.isoformat(),
        "created_by": test_taxon_name_canonical_name_3.created_by,
        "created_on": test_taxon_name_canonical_name_3.created_on.isoformat(),
        "classification_system_ids": [],
        "path": [],
        "deleted": False,
        "is_autonym": False,
        "is_hybrid": False,
        "hybrid_category": None,
        "review": False,
    }


def test_taxon_name_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/taxon_names/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/taxon_names/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/taxon_names")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/taxon_names/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/taxon_names/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/taxon_names/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_kingdom,
    test_taxon_rank,
    test_taxon_name,
    test_taxon_name_2,
    test_manager,
):
    response = client.get("/api/v1/taxon_names", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "hybrid_category": None,
        "canonical_name": test_taxon_name.canonical_name,
        "created_by": test_manager.user_id,
        "created_on": test_taxon_name.created_on.isoformat(),
        "classification_system_ids": [],
    }
    response = client.post(
        "/api/v1/taxon_names", headers=superuser_token_headers, json=taxon_json
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_json.update(
        {
            "canonical_name": test_taxon_name_2.canonical_name,
            "updated_by": test_manager.user_id,
            "updated_on": test_taxon_name.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/taxon_names/{test_taxon_name_2.taxon_name_id}",
        headers=superuser_token_headers,
        json=taxon_json,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_kingdom,
    test_taxon_rank,
    test_taxon_name,
    test_taxon_name_2,
    test_manager,
):
    response = client.get("/api/v1/taxon_names", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "hybrid_category": None,
        "canonical_name": test_taxon_name.canonical_name,
        "created_by": test_manager.user_id,
        "created_on": test_taxon_name.created_on.isoformat(),
        "classification_system_ids": [],
    }
    response = client.post(
        "/api/v1/taxon_names", headers=manager_token_headers, json=taxon_json
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_json.update(
        {
            "canonical_name": test_taxon_name_2.canonical_name,
            "updated_by": test_manager.user_id,
            "updated_on": test_taxon_name.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/taxon_names/{test_taxon_name_2.taxon_name_id}",
        headers=manager_token_headers,
        json=taxon_json,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_kingdom,
    test_taxon_rank,
    test_taxon_name,
    test_taxon_name_2,
    test_manager,
):
    response = client.get("/api/v1/taxon_names", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/taxon_names/{test_taxon_name.taxon_name_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    taxon_json = {
        "kingdom_id": test_kingdom.kingdom_id,
        "rank_id": test_taxon_rank.taxon_rank_id,
        "is_current": True,
        "validated": True,
        "is_hybrid": False,
        "hybrid_category": None,
        "canonical_name": test_taxon_name.canonical_name,
        "created_by": test_manager.user_id,
        "created_on": test_taxon_name.created_on.isoformat(),
        "classification_system_ids": [],
    }
    response = client.post(
        "/api/v1/taxon_names", headers=officer_token_headers, json=taxon_json
    )
    assert response.status_code == status.HTTP_200_OK

    taxon_json.update(
        {
            "canonical_name": test_taxon_name_2.canonical_name,
            "updated_by": test_manager.user_id,
            "updated_on": test_taxon_name.created_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/taxon_names/{test_taxon_name_2.taxon_name_id}",
        headers=officer_token_headers,
        json=taxon_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/taxon_names", status.HTTP_200_OK),
    ("put", "/api/v1/taxon_names/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/taxon_names/1", status.HTTP_403_FORBIDDEN),
    ("post", "/api/v1/taxon_names", status.HTTP_403_FORBIDDEN),
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
