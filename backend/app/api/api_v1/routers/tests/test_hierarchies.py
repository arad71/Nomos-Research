from app.db.hierarchy.model import Hierarchy


def test_get_hierarchies(client, test_hierarchy, superuser_token_headers):
    response = client.get("/api/v1/hierarchies", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "hierarchy_id": test_hierarchy.hierarchy_id,
            "taxon_name_id": test_hierarchy.taxon_name_id,
            "taxon_name": response.json()[0]["taxon_name"],
            "classification_system_id": test_hierarchy.classification_system_id,
            "classification_system": response.json()[0]["classification_system"],
            "parent_nid": test_hierarchy.parent_nid,
            "parent": response.json()[0]["parent"],
            "updated_by": test_hierarchy.updated_by,
            "updated_on": test_hierarchy.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
            "created_by": test_hierarchy.created_by,
            "created_on": test_hierarchy.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        }
    ]


def test_delete_hierarchy(client, test_hierarchy, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(Hierarchy).all() == []


def test_delete_hierarchy_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/hierarchies/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_hierarchy(
    client, test_hierarchy, test_superuser, superuser_token_headers
):
    new_hierarchy = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "parent_nid": test_hierarchy.parent_nid,
        "updated_by": test_superuser.user_id,
        "updated_on": test_hierarchy.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_hierarchy.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        json=new_hierarchy,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_hierarchy["hierarchy_id"] = test_hierarchy.hierarchy_id
    new_hierarchy["updated_on"] = response.json()["updated_on"]
    new_hierarchy["taxon_name"] = response.json()["taxon_name"]
    new_hierarchy["classification_system"] = response.json()["classification_system"]
    new_hierarchy["parent"] = response.json()["parent"]
    assert response.json() == new_hierarchy


def test_edit_hierarchy_not_found(
    client, test_db, test_hierarchy, test_superuser, superuser_token_headers
):
    new_hierarchy = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "parent_nid": test_hierarchy.parent_nid,
        "updated_by": test_superuser.user_id,
        "updated_on": test_hierarchy.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_hierarchy.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/hierarchies/1234", json=new_hierarchy, headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_get_hierarchy(
    client,
    test_hierarchy,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/hierarchies/{test_hierarchy.hierarchy_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "hierarchy_id": test_hierarchy.hierarchy_id,
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "taxon_name": response.json()["taxon_name"],
        "classification_system_id": test_hierarchy.classification_system_id,
        "classification_system": response.json()["classification_system"],
        "parent_nid": test_hierarchy.parent_nid,
        "parent": response.json()["parent"],
        "updated_by": test_hierarchy.updated_by,
        "updated_on": test_hierarchy.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_hierarchy.created_by,
        "created_on": test_hierarchy.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_hierarchy_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/hierarchies/123", headers=superuser_token_headers)
    assert response.status_code == 404
