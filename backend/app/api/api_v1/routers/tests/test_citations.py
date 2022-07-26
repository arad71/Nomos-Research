import pytest
from starlette import status

from app.db.citation.model import Citation


def test_get_citations(client, test_citation, superuser_token_headers):
    response = client.get("/api/v1/citations", headers=superuser_token_headers)
    assert response.status_code == 200
    response_json = response.json()[0]
    assert response.json() == [
        {
            "citation_id": test_citation.citation_id,
            "taxon_name_id": test_citation.taxon_name_id,
            "author_id": test_citation.author_id,
            "author": response_json["author"],
            "author_type": test_citation.author_type.value,
            "author_order": test_citation.author_order,
            "updated_by": test_citation.updated_by,
            "updated_on": test_citation.updated_on.isoformat(),
            "created_by": test_citation.created_by,
            "created_on": test_citation.created_on.isoformat(),
            "deleted": False,
        }
    ]


def test_delete_citation(client, test_citation, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True
    assert test_db.query(Citation).all() == [test_citation]


def test_delete_citation_not_found(client, superuser_token_headers):
    response = client.delete("/api/v1/citations/4321", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_citation(
    client,
    test_citation,
    test_author,
    test_taxon_name,
    test_superuser,
    superuser_token_headers,
):
    new_citation = {
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "author_id": test_author.author_id,
        "author_type": "current",
        "author_order": 0,
        "updated_by": test_superuser.user_id,
        "updated_on": test_citation.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_citation.created_on.isoformat(),
        "deleted": False,
    }

    response = client.put(
        f"/api/v1/citations/{test_citation.citation_id}",
        json=new_citation,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_citation["citation_id"] = test_citation.citation_id
    new_citation["updated_on"] = response.json()["updated_on"]
    new_citation["author"] = response.json()["author"]
    assert response.json() == new_citation


def test_edit_citation_not_found(
    client, test_db, test_citation, test_superuser, superuser_token_headers
):
    new_citation = {
        "citation_id": test_citation.citation_id,
        "taxon_name_id": test_citation.taxon_name_id,
        "author_id": test_citation.author_id,
        "author_type": "current",
        "author_order": 0,
        "updated_by": test_superuser.user_id,
        "updated_on": test_citation.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_citation.created_on.isoformat(),
        "deleted": False,
    }
    response = client.put(
        "/api/v1/citations/1234", json=new_citation, headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_citation(
    client,
    test_citation,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "citation_id": test_citation.citation_id,
        "taxon_name_id": test_citation.taxon_name_id,
        "author_id": test_citation.author_id,
        "author": response.json()["author"],
        "author_type": test_citation.author_type,
        "author_order": test_citation.author_order,
        "updated_by": test_citation.updated_by,
        "updated_on": test_citation.updated_on.isoformat(),
        "created_by": test_citation.created_by,
        "created_on": test_citation.created_on.isoformat(),
        "deleted": False,
    }


def test_citation_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/citations/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/citations")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/citations/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/citations/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/citations/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


NEW_CITATION = {
    "author_order": 0,
    "updated_by": None,
    "updated_on": None,
    "deleted": False,
}


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_citation,
    test_taxon_name,
    test_author,
    test_superuser,
):
    response = client.get("/api/v1/citations", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    citation_json = {
        **NEW_CITATION,
        "author_type": "basionym",
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "author_id": test_author.author_id,
        "created_by": test_superuser.user_id,
        "created_on": test_citation.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/citations",
        headers=superuser_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK
    citation_id = response.json()["citation_id"]

    citation_json.update(
        {
            "updated_by": test_superuser.user_id,
            "updated_on": test_citation.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/citations/{citation_id}",
        headers=superuser_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/citations/{citation_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_citation,
    test_taxon_name,
    test_author,
    test_manager,
):
    response = client.get("/api/v1/citations", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    citation_json = {
        **NEW_CITATION,
        "author_type": "basionym",
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "author_id": test_author.author_id,
        "created_by": test_manager.user_id,
        "created_on": test_citation.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/citations",
        headers=manager_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK
    citation_id = response.json()["citation_id"]
    citation_json.update(
        {
            "updated_by": test_manager.user_id,
            "updated_on": test_citation.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/citations/{citation_id}",
        headers=manager_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/citations/{citation_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_citation,
    test_taxon_name,
    test_author,
    test_officer,
):
    response = client.get("/api/v1/citations", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/citations/{test_citation.citation_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    citation_json = {
        **NEW_CITATION,
        "author_type": "basionym",
        "taxon_name_id": test_taxon_name.taxon_name_id,
        "author_id": test_author.author_id,
        "created_by": test_officer.user_id,
        "created_on": test_citation.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/citations",
        headers=officer_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK
    citation_id = response.json()["citation_id"]
    citation_json.update(
        {
            "updated_by": test_officer.user_id,
            "updated_on": test_citation.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/citations/{citation_id}",
        headers=officer_token_headers,
        json=citation_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/citations", status.HTTP_200_OK),
    ("post", "/api/v1/citations", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/citations/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/citations/1", status.HTTP_403_FORBIDDEN),
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
