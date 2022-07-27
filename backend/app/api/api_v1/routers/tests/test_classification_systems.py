import pytest
from starlette import status

from app.db.classification_system.model import ClassificationSystem


def test_get_classification_systems(
    client, test_classification_system, superuser_token_headers
):
    response = client.get(
        "/api/v1/classification_systems", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "classification_system_id": test_classification_system.classification_system_id,
            "class_desc": test_classification_system.class_desc,
            "class_type": test_classification_system.class_type.value,
            "preferred": test_classification_system.preferred,
            "updated_by": test_classification_system.updated_by,
            "updated_on": test_classification_system.updated_on.isoformat(),
            "created_by": test_classification_system.created_by,
            "created_on": test_classification_system.created_on.isoformat(),
        }
    ]


def test_delete_classification_system(
    client, test_classification_system, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(ClassificationSystem).all() == [test_classification_system]


def test_hard_delete_classification_system(
    client, test_classification_system, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}/hard",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "classification_system_id": test_classification_system.classification_system_id
    }
    assert test_db.query(ClassificationSystem).all() == []


def test_delete_classification_system_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/classification_systems/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_classification_system(
    client, test_classification_system, test_superuser, superuser_token_headers
):
    new_classification_system = {
        "class_desc": "Classification System 3",
        "class_type": "informal",
        "preferred": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_classification_system.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_classification_system.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        json=new_classification_system,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_classification_system[
        "classification_system_id"
    ] = test_classification_system.classification_system_id
    new_classification_system["updated_on"] = response.json()["updated_on"]
    assert response.json() == new_classification_system


def test_edit_classification_system_not_found(
    client, test_db, test_classification_system, test_superuser, superuser_token_headers
):
    new_classification_system = {
        "classification_system_id": test_classification_system.classification_system_id,
        "class_desc": "Classification System 3",
        "class_type": "informal",
        "preferred": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_classification_system.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_classification_system.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/classification_systems/1234",
        json=new_classification_system,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_classification_system(
    client,
    test_classification_system,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "classification_system_id": test_classification_system.classification_system_id,
        "class_desc": test_classification_system.class_desc,
        "class_type": test_classification_system.class_type.value,
        "preferred": test_classification_system.preferred,
        "updated_by": test_classification_system.updated_by,
        "updated_on": test_classification_system.updated_on.isoformat(),
        "created_by": test_classification_system.created_by,
        "created_on": test_classification_system.created_on.isoformat(),
    }


def test_classification_system_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/classification_systems/123", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/classification_systems")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/classification_systems/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/classification_systems/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/classification_systems/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_app_support_permissions(
    client,
    app_support_token_headers,
    test_classification_system,
    test_app_support,
):
    response = client.get(
        "/api/v1/classification_systems", headers=app_support_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    classification_system_id = test_classification_system.classification_system_id
    response = client.get(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response = client.delete(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "class_desc": "CLASS_DESC",
        "class_type": "informal",
        "preferred": True,
        "updated_by": None,
        "created_by": test_app_support.user_id,
    }
    response = client.post(
        "/api/v1/classification_systems", headers=app_support_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
    classification_system_id = response.json()["classification_system_id"]

    json.update({"updated_by": test_app_support.user_id})
    response = client.put(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=app_support_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=app_support_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_classification_system,
    test_superuser,
):
    response = client.get(
        "/api/v1/classification_systems", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    classification_system_id = test_classification_system.classification_system_id
    response = client.get(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response = client.delete(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    json = {
        "class_desc": "CLASS_DESC",
        "class_type": "informal",
        "preferred": True,
        "updated_by": None,
        "created_by": test_superuser.user_id,
    }
    response = client.post(
        "/api/v1/classification_systems", headers=superuser_token_headers, json=json
    )
    assert response.status_code == status.HTTP_200_OK
    classification_system_id = response.json()["classification_system_id"]

    json.update({"updated_by": test_superuser.user_id})
    response = client.put(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=superuser_token_headers,
        json=json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/classification_systems/{classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/classification_systems", status.HTTP_200_OK),
    ("post", "/api/v1/classification_systems", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/classification_systems/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/classification_systems/1", status.HTTP_403_FORBIDDEN),
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
