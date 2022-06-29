import pytest
from starlette import status

from app.db.informal_group.model import InformalGroup


def test_get_informal_groups(
    client, test_informal_group, test_hierarchy, superuser_token_headers
):
    response = client.get("/api/v1/informal_groups", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "informal_group_id": test_informal_group.informal_group_id,
            "taxon_name_id": test_hierarchy.taxon_name_id,
            "classification_system_id": test_hierarchy.classification_system_id,
            "classification_system": response.json()[0]["classification_system"],
            "updated_by": test_informal_group.updated_by,
            "updated_on": test_informal_group.updated_on.isoformat(),
            "created_by": test_informal_group.created_by,
            "created_on": test_informal_group.created_on.isoformat(),
        }
    ]


def test_delete_informal_group(
    client, test_informal_group, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(InformalGroup).all() == [test_informal_group]


def test_delete_informal_group_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/informal_groups/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_informal_group(
    client, test_informal_group, test_hierarchy, test_superuser, superuser_token_headers
):
    new_informal_group = {
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "updated_by": test_superuser.user_id,
        "updated_on": test_informal_group.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_informal_group.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/informal_groups/{test_informal_group.informal_group_id}",
        json=new_informal_group,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
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
        "updated_on": test_informal_group.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_informal_group.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/informal_groups/1234",
        json=new_informal_group,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


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
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "informal_group_id": test_informal_group.informal_group_id,
        "taxon_name_id": test_hierarchy.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "classification_system": response.json()["classification_system"],
        "updated_by": test_informal_group.updated_by,
        "updated_on": test_informal_group.updated_on.isoformat(),
        "created_by": test_informal_group.created_by,
        "created_on": test_informal_group.created_on.isoformat(),
    }


def test_informal_group_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/informal_groups/123", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/informal_groups")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/informal_groups/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/informal_groups/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/informal_groups/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_informal_group,
    test_hierarchy,
    test_taxon_name_2,
    test_superuser,
):
    response = client.get("api/v1/informal_groups", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "taxon_name_id": test_taxon_name_2.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "created_by": test_superuser.user_id,
        "created_on": test_informal_group.created_on.isoformat(),
    }
    response = client.post(
        "api/v1/informal_groups",
        headers=superuser_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    informal_group_id = response.json()["informal_group_id"]
    json.update(
        {
            "updated_by": test_superuser.user_id,
            "updated_on": test_informal_group.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"api/v1/informal_groups/{informal_group_id}",
        headers=superuser_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_informal_group,
    test_taxon_name_2,
    test_hierarchy,
    test_manager,
):
    response = client.get("api/v1/informal_groups", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "taxon_name_id": test_taxon_name_2.taxon_name_id,
        "classification_system_id": test_hierarchy.classification_system_id,
        "created_by": test_manager.user_id,
        "created_on": test_informal_group.created_on.isoformat(),
    }
    response = client.post(
        "api/v1/informal_groups",
        headers=manager_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    informal_group_id = response.json()["informal_group_id"]
    json.update(
        {
            "updated_by": test_manager.user_id,
            "updated_on": test_informal_group.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"api/v1/informal_groups/{informal_group_id}",
        headers=manager_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"api/v1/informal_groups/{test_informal_group.informal_group_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "api/v1/informal_groups", status.HTTP_200_OK),
    ("post", "api/v1/informal_groups", status.HTTP_403_FORBIDDEN),
    ("put", "api/v1/informal_groups/1", status.HTTP_403_FORBIDDEN),
    ("delete", "api/v1/informal_groups/1", status.HTTP_403_FORBIDDEN),
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
