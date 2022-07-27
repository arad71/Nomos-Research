import pytest
from starlette import status

from app.db.cross_reference.enums import CrossReferenceType
from app.db.cross_reference.model import CrossReference


def test_get_cross_references(
    client, test_cross_reference, test_taxon_name, superuser_token_headers
):
    response = client.get("/api/v1/cross_references", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response_json: list[dict] = response.json()
    assert len(response_json) == 1
    item = response_json[0]
    del item["old_name"]
    del item["new_name"]
    assert item == {
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_id": test_cross_reference.cross_reference_id,
        "cross_reference_type": test_cross_reference.cross_reference_type,
        "updated_by": test_cross_reference.updated_by,
        "updated_on": test_cross_reference.updated_on.isoformat(),
        "created_by": test_cross_reference.created_by,
        "created_on": test_cross_reference.created_on.isoformat(),
    }


def test_delete_cross_reference(
    client, test_cross_reference, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(CrossReference).all() == [test_cross_reference]


def test_hard_delete_cross_reference(
    client, test_cross_reference, test_db, superuser_token_headers, test_superuser
):
    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}/hard",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "cross_reference_id": test_cross_reference.cross_reference_id
    }
    assert test_db.query(CrossReference).all() == []


def test_delete_cross_reference_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/cross_references/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_cross_reference(
    client,
    test_cross_reference,
    test_taxon_name,
    test_superuser,
    superuser_token_headers,
):
    new_cross_reference = {
        "old_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_type": "misapplied_name",
        "updated_by": test_superuser.user_id,
        "updated_on": test_cross_reference.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_cross_reference.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        json=new_cross_reference,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_cross_reference["cross_reference_id"] = test_cross_reference.cross_reference_id
    json = response.json()
    new_cross_reference["updated_on"] = json["updated_on"]
    new_cross_reference["new_name_id"] = test_taxon_name.taxon_name_id
    del json["old_name"]
    del json["new_name"]
    assert json == new_cross_reference


def test_edit_cross_reference_not_found(
    client,
    test_cross_reference,
    test_taxon_name,
    test_superuser,
    superuser_token_headers,
):
    new_cross_reference = {
        "old_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_type": "misapplied_name",
        "deleted": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_cross_reference.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_cross_reference.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/cross_references/1234",
        json=new_cross_reference,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_cross_reference(
    client,
    test_cross_reference,
    test_taxon_name,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    json = response.json()
    del json["old_name"]
    del json["new_name"]

    assert json == {
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_id": test_cross_reference.cross_reference_id,
        "cross_reference_type": "misapplied_name",
        "updated_by": test_cross_reference.updated_by,
        "updated_on": test_cross_reference.updated_on.isoformat(),
        "created_by": test_cross_reference.created_by,
        "created_on": test_cross_reference.created_on.isoformat(),
    }


def test_cross_reference_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/cross_references/123", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/cross_references")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/cross_references/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/cross_references/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/cross_references/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


NEW_CROSS_REFERENCE = {
    "cross_reference_type": "misapplied_name",
    "updated_by": None,
    "updated_on": None,
}


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_cross_reference,
    test_taxon_name,
    test_taxon_name_2,
    test_superuser,
):
    response = client.get("/api/v1/cross_references", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    cross_reference_json = {
        **NEW_CROSS_REFERENCE,
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name_2.taxon_name_id,
        "created_by": test_superuser.user_id,
        "created_on": test_cross_reference.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/cross_references",
        headers=superuser_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK

    cross_reference_json.update(
        {
            "updated_by": test_superuser.user_id,
            "updated_on": test_cross_reference.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_cross_reference,
    test_taxon_name,
    test_taxon_name_2,
    test_manager,
):
    response = client.get("/api/v1/cross_references", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    cross_reference_json = {
        **NEW_CROSS_REFERENCE,
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name_2.taxon_name_id,
        "created_by": test_manager.user_id,
        "created_on": test_cross_reference.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/cross_references",
        headers=manager_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK

    cross_reference_json.update(
        {
            "updated_by": test_manager.user_id,
            "updated_on": test_cross_reference.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=manager_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_cross_reference,
    test_taxon_name,
    test_taxon_name_2,
    test_officer,
):
    response = client.get("/api/v1/cross_references", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    cross_reference_json = {
        **NEW_CROSS_REFERENCE,
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name_2.taxon_name_id,
        "created_by": test_officer.user_id,
        "created_on": test_cross_reference.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/cross_references",
        headers=officer_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK

    cross_reference_json.update(
        {
            "updated_by": test_officer.user_id,
            "updated_on": test_cross_reference.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=officer_token_headers,
        json=cross_reference_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/cross_references", status.HTTP_200_OK),
    ("post", "/api/v1/cross_references", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/cross_references/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/cross_references/1", status.HTTP_403_FORBIDDEN),
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
