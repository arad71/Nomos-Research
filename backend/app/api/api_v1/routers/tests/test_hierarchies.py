import pytest
from starlette import status

from app.db.hierarchy.model import Hierarchy
from app.db.taxon_name.model import TaxonName


def test_get_hierarchies(
    client, test_hierarchy, test_taxon_name: TaxonName, superuser_token_headers
):
    response = client.get("/api/v1/hierarchies", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "hierarchy_id": test_hierarchy.hierarchy_id,
            "taxon_name_id": test_hierarchy.taxon_name_id,
            "taxon_name": response.json()[0]["taxon_name"],
            "classification_system_id": test_hierarchy.classification_system_id,
            "classification_system": response.json()[0]["classification_system"],
            "parent_nid": test_hierarchy.parent_nid,
            "parent_name": response.json()[0]["parent_name"],
            "updated_by": test_hierarchy.updated_by,
            "updated_on": test_hierarchy.updated_on.isoformat(),
            "created_by": test_hierarchy.created_by,
            "created_on": test_hierarchy.created_on.isoformat(),
            "deleted": False,
            "formatted_scientific_name": "<i>Testuninomial</i>",
            "path": {
                "path": "{}.{}".format(
                    test_hierarchy.classification_system_id,
                    test_hierarchy.taxon_name_id,
                )
            },
            "rank_name": "Rank Name 1",
            "scientific_name": "Testuninomial",
        }
    ]


def test_hierarchies_with_data(
    client,
    test_hierarchies,
    superuser_token_headers,
    test_chordata,
    test_mammalia,
    test_reptilia,
    test_carnivora,
    test_panthera,
    test_panthera_leo,
    test_classification_system,
):
    response = client.get("/api/v1/hierarchies", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    new_hierarchy = {
        "parent_nid": test_reptilia.taxon_name_id,
        "taxon_name_id": test_carnivora.taxon_name_id,
        "classification_system_id": test_classification_system.classification_system_id,
    }
    carnivore = test_hierarchies["carnivore"]
    existing_path = carnivore.path

    response = client.put(
        f"/api/v1/hierarchies/{carnivore.hierarchy_id}",
        json=new_hierarchy,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_path = response.json()["path"]["path"]
    assert new_path != existing_path
    assert new_path == "{}.{}.{}.{}".format(
        test_classification_system.classification_system_id,
        test_chordata.taxon_name_id,
        test_reptilia.taxon_name_id,
        test_carnivora.taxon_name_id,
    )
    panther = test_hierarchies["panther"]
    response = client.get(
        f"/api/v1/hierarchies/{panther.hierarchy_id}",
        headers=superuser_token_headers,
    )
    new_path = response.json()["path"]["path"]
    assert new_path == "{}.{}.{}.{}.{}".format(
        test_classification_system.classification_system_id,
        test_chordata.taxon_name_id,
        test_reptilia.taxon_name_id,
        test_carnivora.taxon_name_id,
        test_panthera.taxon_name_id,
    )

    new_hierarchy = {
        "parent_nid": test_panthera.taxon_name_id,
        "taxon_name_id": test_panthera_leo.taxon_name_id,
        "classification_system_id": test_classification_system.classification_system_id,
    }
    response = client.post(
        f"/api/v1/hierarchies",
        json=new_hierarchy,
        headers=superuser_token_headers,
    )
    json = response.json()
    new_path = json["path"]["path"]

    expected_path = "{}.{}.{}.{}.{}.{}".format(
        test_classification_system.classification_system_id,
        test_chordata.taxon_name_id,
        test_reptilia.taxon_name_id,
        test_carnivora.taxon_name_id,
        test_panthera.taxon_name_id,
        test_panthera_leo.taxon_name_id,
    )
    assert new_path == expected_path
    hierarchy_id = json["hierarchy_id"]
    response = client.get(
        f"/api/v1/hierarchies/{hierarchy_id}",
        headers=superuser_token_headers,
    )
    new_path = response.json()["path"]["path"]
    assert test_panthera_leo.path[0] == expected_path
    assert new_path == expected_path


def test_delete_hierarchy(client, test_hierarchy, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(Hierarchy).all() == [test_hierarchy]


def test_hard_delete_hierarchy(
    client, test_hierarchy, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}/hard",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"hierarchy_id": test_hierarchy.hierarchy_id}
    assert test_db.query(Hierarchy).all() == []


def test_delete_hierarchy_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/hierarchies/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_hierarchy(
    client, test_hierarchy, test_superuser, superuser_token_headers, test_db
):
    new_hierarchy = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "parent_nid": test_hierarchy.parent_nid,
        "updated_by": test_superuser.user_id,
        "updated_on": test_hierarchy.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_hierarchy.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        json=new_hierarchy,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_hierarchy["hierarchy_id"] = test_hierarchy.hierarchy_id
    new_hierarchy["updated_on"] = response.json()["updated_on"]
    new_hierarchy["taxon_name"] = response.json()["taxon_name"]
    new_hierarchy["classification_system"] = response.json()["classification_system"]
    new_hierarchy["parent_name"] = response.json()["parent_name"]
    new_hierarchy["formatted_scientific_name"] = "<i>Testuninomial</i>"
    new_hierarchy["path"] = {
        "path": "{}.{}".format(
            test_hierarchy.classification_system_id, test_hierarchy.taxon_name_id
        )
    }
    new_hierarchy["rank_name"] = "Rank Name 1"
    new_hierarchy["scientific_name"] = "Testuninomial"

    new_hierarchy["deleted"] = False
    assert response.json() == new_hierarchy


def test_edit_hierarchy_not_found(
    client, test_db, test_hierarchy, test_superuser, superuser_token_headers
):
    new_hierarchy = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "parent_nid": test_hierarchy.parent_nid,
        "updated_by": test_superuser.user_id,
        "updated_on": test_hierarchy.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_hierarchy.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/hierarchies/1234", json=new_hierarchy, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_hierarchy(
    client,
    test_hierarchy,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "hierarchy_id": test_hierarchy.hierarchy_id,
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "taxon_name": response.json()["taxon_name"],
        "classification_system_id": test_hierarchy.classification_system_id,
        "classification_system": response.json()["classification_system"],
        "parent_nid": test_hierarchy.parent_nid,
        "parent_name": response.json()["parent_name"],
        "updated_by": test_hierarchy.updated_by,
        "updated_on": test_hierarchy.updated_on.isoformat(),
        "created_by": test_hierarchy.created_by,
        "created_on": test_hierarchy.created_on.isoformat(),
        "formatted_scientific_name": "<i>Testuninomial</i>",
        "path": {
            "path": "{}.{}".format(
                test_hierarchy.classification_system_id, test_hierarchy.taxon_name_id
            )
        },
        "rank_name": "Rank Name 1",
        "scientific_name": "Testuninomial",
        "deleted": False,
    }


def test_hierarchy_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/hierarchies/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/hierarchies")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/hierarchies/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/hierarchies/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/hierarchies/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


NEW_HIERARCHY = {
    "updated_by": None,
    "updated_on": None,
}


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_hierarchy,
    test_taxon_name,
    test_classification_system,
    test_taxon_name_2,
    test_taxon_name_canonical_name_1,
    test_taxon_name_3,
    test_superuser,
):
    response = client.get("/api/v1/hierarchies", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    hierarchy_json = {
        **NEW_HIERARCHY,
        "taxon_name_id": test_taxon_name_canonical_name_1.taxon_name_id,
        "classification_system_id": test_classification_system.classification_system_id,
        "parent_nid": test_taxon_name_2.taxon_name_id,
        "created_by": test_superuser.user_id,
        "created_on": test_hierarchy.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/hierarchies",
        headers=superuser_token_headers,
        json=hierarchy_json,
    )
    assert response.status_code == status.HTTP_200_OK
    hierarchy_json = response.json()
    hierarchy_id = hierarchy_json["hierarchy_id"]
    hierarchy_json.update({
        "parent_nid": test_taxon_name_3.taxon_name_id,
        "updated_by": test_superuser.user_id,
        "updated_on": test_hierarchy.updated_on.isoformat(),
    })
    response = client.put(
        f"/api/v1/hierarchies/{hierarchy_id}",
        headers=superuser_token_headers,
        json=hierarchy_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_hierarchy,
    test_taxon_name,
    test_hierarchical_classification_system,
    test_taxon_name_2,
    test_taxon_name_3,
    test_taxon_name_canonical_name_1,
    test_manager,
    test_db,
):
    response = client.get("/api/v1/hierarchies", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    hierarchy_json = {
        **NEW_HIERARCHY,
        "taxon_name_id": test_taxon_name_canonical_name_1.taxon_name_id,
        "classification_system_id": (
            test_hierarchical_classification_system.classification_system_id
        ),
        "parent_nid": test_taxon_name_2.taxon_name_id,
    }
    response = client.post(
        "/api/v1/hierarchies",
        headers=manager_token_headers,
        json=hierarchy_json,
    )
    assert response.status_code == status.HTTP_200_OK
    saved_hierarchy = response.json()
    hierarchy_id = saved_hierarchy["hierarchy_id"]
    saved_hierarchy.update({
        "parent_nid": test_taxon_name_3.taxon_name_id,
    })
    response = client.put(
        f"/api/v1/hierarchies/{hierarchy_id}",
        headers=manager_token_headers,
        json=saved_hierarchy,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/hierarchies", status.HTTP_200_OK),
    ("post", "/api/v1/hierarchies", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/hierarchies/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/hierarchies/1", status.HTTP_403_FORBIDDEN),
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


@pytest.mark.parametrize(
    parameter_names,
    parameter_values,
)
def test_officer_permissions(
    client, officer_token_headers, method, endpoint, status_code
):
    response = getattr(client, method)(endpoint, headers=officer_token_headers)
    assert response.status_code == status_code


def test_rebuild_hierarchies(
    client,
    superuser_token_headers,
    test_hierarchies,
):
    response = client.post(
        "/api/v1/hierarchies/rebuild", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_202_ACCEPTED
