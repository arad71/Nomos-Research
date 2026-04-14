from starlette import status

from app.db.taxon_name_parent.model import TaxonNameParent


def test_get_taxon_name_parents(
    client, test_taxon_name_parent, superuser_token_headers
):
    response = client.get("/api/v1/taxon_name_parents", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()[0]
    assert response.json() == [
        {
            "taxon_name_parent_id": test_taxon_name_parent.taxon_name_parent_id,
            "taxon_name_id": test_taxon_name_parent.taxon_name_id,
            "parent_taxon_name_id": test_taxon_name_parent.parent_taxon_name_id,
            "sequence": test_taxon_name_parent.sequence,
            "taxon_name": response_json["taxon_name"],
            "parent_taxon_name": response_json["parent_taxon_name"],
            "updated_by": test_taxon_name_parent.updated_by,
            "updated_on": test_taxon_name_parent.updated_on.isoformat(),
            "created_by": test_taxon_name_parent.created_by,
            "created_on": test_taxon_name_parent.created_on.isoformat(),
            "deleted": False,
        }
    ]


def test_get_taxon_name_parent(client, test_taxon_name_parent, superuser_token_headers):
    response = client.get(
        f"/api/v1/taxon_name_parents/{test_taxon_name_parent.taxon_name_parent_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()
    assert response.json() == {
        "taxon_name_parent_id": test_taxon_name_parent.taxon_name_parent_id,
        "taxon_name_id": test_taxon_name_parent.taxon_name_id,
        "parent_taxon_name_id": test_taxon_name_parent.parent_taxon_name_id,
        "sequence": test_taxon_name_parent.sequence,
        "taxon_name": response_json["taxon_name"],
        "parent_taxon_name": response_json["parent_taxon_name"],
        "updated_by": test_taxon_name_parent.updated_by,
        "updated_on": test_taxon_name_parent.updated_on.isoformat(),
        "created_by": test_taxon_name_parent.created_by,
        "created_on": test_taxon_name_parent.created_on.isoformat(),
        "deleted": False,
    }


def test_create_taxon_name_parent(
    client,
    test_taxon_name,
    test_taxon_name_3,
    superuser_token_headers,
):
    payload = {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "parent_taxon_name_id": test_taxon_name_3.taxon_name_id,
        "sequence": 2,
    }
    response = client.post(
        "/api/v1/taxon_name_parents",
        json=payload,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()
    assert response_json["taxon_name_id"] == payload["taxon_name_id"]
    assert response_json["parent_taxon_name_id"] == payload["parent_taxon_name_id"]
    assert response_json["sequence"] == payload["sequence"]
    assert response_json["deleted"] is False


def test_edit_taxon_name_parent(
    client,
    test_taxon_name_parent,
    test_taxon_name,
    test_taxon_name_3,
    test_superuser,
    superuser_token_headers,
):
    payload = {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "parent_taxon_name_id": test_taxon_name_3.taxon_name_id,
        "sequence": 3,
        "updated_by": test_superuser.user_id,
        "updated_on": test_taxon_name_parent.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_taxon_name_parent.created_on.isoformat(),
    }
    response = client.put(
        f"/api/v1/taxon_name_parents/{test_taxon_name_parent.taxon_name_parent_id}",
        json=payload,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    response_json = response.json()
    assert (
        response_json["taxon_name_parent_id"]
        == test_taxon_name_parent.taxon_name_parent_id
    )
    assert response_json["parent_taxon_name_id"] == test_taxon_name_3.taxon_name_id
    assert response_json["sequence"] == 3


def test_delete_taxon_name_parent(
    client, test_taxon_name_parent, test_db, superuser_token_headers
):
    response = client.delete(
        f"/api/v1/taxon_name_parents/{test_taxon_name_parent.taxon_name_parent_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(TaxonNameParent).all() == [test_taxon_name_parent]


def test_delete_taxon_name_parent_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/taxon_name_parents/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_taxon_name_parent_rejects_self_parent(
    client,
    test_taxon_name,
    superuser_token_headers,
):
    payload = {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "parent_taxon_name_id": test_taxon_name.taxon_name_id,
        "sequence": 1,
    }
    response = client.post(
        "/api/v1/taxon_name_parents",
        json=payload,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
