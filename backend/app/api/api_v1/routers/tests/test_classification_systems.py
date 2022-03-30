from app.db.classification_system.model import ClassificationSystem


def test_get_classification_systems(
    client, test_classification_system, superuser_token_headers
):
    response = client.get(
        "/api/v1/classification_systems", headers=superuser_token_headers
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "classification_system_id": test_classification_system.classification_system_id,
            "class_desc": test_classification_system.class_desc,
            "class_type": test_classification_system.class_type.value,
            "preferred": test_classification_system.preferred,
            "updated_by": test_classification_system.updated_by,
            "updated_on": test_classification_system.updated_on.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            ),
            "created_by": test_classification_system.created_by,
            "created_on": test_classification_system.created_on.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            ),
        }
    ]


def test_delete_classification_system(
    client, test_classification_system, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(ClassificationSystem).all() == []


def test_delete_classification_system_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/classification_systems/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_classification_system(
    client, test_classification_system, test_superuser, superuser_token_headers
):
    new_classification_system = {
        "class_desc": "Classification System 3",
        "class_type": "informal",
        "preferred": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_classification_system.updated_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
        "created_by": test_superuser.user_id,
        "created_on": test_classification_system.created_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
    }

    response = client.put(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        json=new_classification_system,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
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
        "updated_on": test_classification_system.updated_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
        "created_by": test_superuser.user_id,
        "created_on": test_classification_system.created_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
    }
    response = client.put(
        "/api/v1/classification_systems/1234",
        json=new_classification_system,
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_get_classification_system(
    client,
    test_classification_system,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/classification_systems/{test_classification_system.classification_system_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json() == {
        "classification_system_id": test_classification_system.classification_system_id,
        "class_desc": test_classification_system.class_desc,
        "class_type": test_classification_system.class_type.value,
        "preferred": test_classification_system.preferred,
        "updated_by": test_classification_system.updated_by,
        "updated_on": test_classification_system.updated_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
        "created_by": test_classification_system.created_by,
        "created_on": test_classification_system.created_on.strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        ),
    }


def test_classification_system_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/classification_systems/123", headers=superuser_token_headers
    )
    assert response.status_code == 404
