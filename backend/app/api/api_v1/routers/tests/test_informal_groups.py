from app.db.informal_group.model import InformalGroup


def test_get_informal_groups(
    client, test_informal_group, test_hierarchy, superuser_token_headers
):
    response = client.get("/api/v1/informal_groups", headers=superuser_token_headers)
    assert response.status_code == 200
    assert response.json() == [
        {
            "informal_group_id": test_informal_group.informal_group_id,
            "taxon_name_id": test_hierarchy.taxon_name_id,
            "classification_system_id": test_hierarchy.classification_system_id,
            "classification_system": response.json()[0]["classification_system"],
            "updated_by": test_informal_group.updated_by,
            "updated_on": test_informal_group.updated_on.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            ),
            "created_by": test_informal_group.created_by,
            "created_on": test_informal_group.created_on.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            ),
        }
    ]


def test_delete_informal_group(
    client, test_informal_group, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(InformalGroup).all() == []


def test_delete_informal_group_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/informal_groups/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_informal_group(
    client, test_informal_group, test_hierarchy, test_superuser, superuser_token_headers
):
    new_informal_group = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "updated_by": test_superuser.user_id,
        "updated_on": test_informal_group.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_informal_group.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/informal_groups/{test_informal_group.informal_group_id}",
        json=new_informal_group,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    new_informal_group["informal_group_id"] = test_informal_group.informal_group_id
    new_informal_group["updated_on"] = response.json()["updated_on"]
    new_informal_group["classification_system"] = response.json()[
        "classification_system"
    ]
    assert response.json() == new_informal_group


def test_edit_informal_group_not_found(
    client,
    test_db,
    test_informal_group,
    test_hierarchy,
    test_superuser,
    superuser_token_headers,
):
    new_informal_group = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "updated_by": test_superuser.user_id,
        "updated_on": test_informal_group.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_informal_group.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/informal_groups/1234",
        json=new_informal_group,
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_get_informal_group(
    client,
    test_informal_group,
    test_hierarchy,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "informal_group_id": test_informal_group.informal_group_id,
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "classification_system": response.json()["classification_system"],
        "updated_by": test_informal_group.updated_by,
        "updated_on": test_informal_group.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_informal_group.created_by,
        "created_on": test_informal_group.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_informal_group_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/informal_groups/123", headers=superuser_token_headers
    )
    assert response.status_code == 404
