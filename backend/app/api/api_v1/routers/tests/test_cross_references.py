from app.db.cross_reference.enums import CrossReferenceType
from app.db.cross_reference.model import CrossReference


def test_get_cross_references(
    client, test_cross_reference, test_taxon_name, superuser_token_headers
):
    response = client.get("/api/v1/cross_references", headers=superuser_token_headers)
    assert response.status_code == 200
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
        "active": test_cross_reference.active,
        "updated_by": test_cross_reference.updated_by,
        "updated_on": test_cross_reference.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_cross_reference.created_by,
        "created_on": test_cross_reference.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_delete_cross_reference(
    client, test_cross_reference, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert test_db.query(CrossReference).all() == []


def test_delete_cross_reference_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/cross_references/4321", headers=superuser_token_headers
    )
    assert response.status_code == 404


def test_edit_cross_reference(
    client,
    test_cross_reference,
    test_taxon_name,
    test_superuser,
    superuser_token_headers,
):
    new_cross_reference = {
        "old_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_type": "mis",
        "active": True,
        "updated_by": test_superuser.user_id,
        "updated_on": test_cross_reference.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_cross_reference.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }

    response = client.put(
        f"/api/v1/cross_references/{test_cross_reference.cross_reference_id}",
        json=new_cross_reference,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
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
        "cross_reference_type": "mis",
        "active": False,
        "updated_by": test_superuser.user_id,
        "updated_on": test_cross_reference.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_superuser.user_id,
        "created_on": test_cross_reference.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }
    response = client.put(
        "/api/v1/cross_references/1234",
        json=new_cross_reference,
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


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
    assert response.status_code == 200
    json = response.json()
    del json["old_name"]
    del json["new_name"]

    assert json == {
        "old_name_id": test_taxon_name.taxon_name_id,
        "new_name_id": test_taxon_name.taxon_name_id,
        "cross_reference_id": test_cross_reference.cross_reference_id,
        "cross_reference_type": "mis",
        "active": test_cross_reference.active,
        "updated_by": test_cross_reference.updated_by,
        "updated_on": test_cross_reference.updated_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "created_by": test_cross_reference.created_by,
        "created_on": test_cross_reference.created_on.strftime("%Y-%m-%dT%H:%M:%S.%f"),
    }


def test_cross_reference_not_found(client, superuser_token_headers):
    response = client.get(
        "/api/v1/cross_references/123", headers=superuser_token_headers
    )
    assert response.status_code == 404
