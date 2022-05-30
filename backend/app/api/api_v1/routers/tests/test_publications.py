import pytest
from starlette import status

from app.db.publication.model import Publication


def test_get_publications(client, test_publication, superuser_token_headers):
    response = client.get("/api/v1/publications", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "publication_id": test_publication.publication_id,
            "bad_publication": test_publication.bad_publication,
            "abbreviated_title": test_publication.abbreviated_title,
            "title": test_publication.title,
            "author": [],
            "publication_day": test_publication.publication_day,
            "publication_month": test_publication.publication_month,
            "publication_year": test_publication.publication_year,
            "publication_date": test_publication.publication_date,
            "updated_by": test_publication.updated_by,
            "updated_on": test_publication.updated_on.isoformat(),
            "created_by": test_publication.created_by,
            "created_on": test_publication.created_on.isoformat(),
            "author_ids": [],
            "author_names": [],
        }
    ]


def test_delete_publication(client, test_publication, test_db, superuser_token_headers):
    response = client.delete(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert test_db.query(Publication).all() == []


def test_delete_publication_not_found(client, superuser_token_headers):
    response = client.delete(
        "/api/v1/publications/4321", headers=superuser_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_edit_publication(
    client, test_publication, test_superuser, superuser_token_headers
):
    new_publication = {
        "bad_publication": test_publication.bad_publication,
        "abbreviated_title": test_publication.abbreviated_title,
        "title": test_publication.title,
        "publication_day": test_publication.publication_day,
        "publication_month": test_publication.publication_month,
        "publication_year": test_publication.publication_year,
        "publication_date": test_publication.publication_date,
        "updated_by": test_superuser.user_id,
        "updated_on": test_publication.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_publication.created_on.isoformat(),
    }

    response = client.put(
        f"/api/v1/publications/{test_publication.publication_id}",
        json=new_publication,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    new_publication["publication_id"] = test_publication.publication_id
    new_publication["updated_on"] = response.json()["updated_on"]
    new_publication["author"] = []
    new_publication["author_ids"] = []
    new_publication["author_names"] = []
    assert response.json() == new_publication


def test_edit_publication_not_found(
    client, test_db, test_publication, test_superuser, superuser_token_headers
):
    new_publication = {
        "bad_publication": True,
        "abbreviated_title": "PUBLICATION 2",
        "title": "PUBLICATION_NAME",
        "updated_by": test_superuser.user_id,
        "updated_on": test_publication.updated_on.isoformat(),
        "created_by": test_superuser.user_id,
        "created_on": test_publication.created_on.isoformat(),
    }
    response = client.put(
        "/api/v1/publications/1234",
        json=new_publication,
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_publication(
    client,
    test_publication,
    superuser_token_headers,
):
    response = client.get(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "publication_id": test_publication.publication_id,
        "bad_publication": test_publication.bad_publication,
        "abbreviated_title": test_publication.abbreviated_title,
        "title": test_publication.title,
        "publication_day": test_publication.publication_day,
        "publication_month": test_publication.publication_month,
        "publication_year": test_publication.publication_year,
        "publication_date": test_publication.publication_date,
        "author": [],
        "updated_by": test_publication.updated_by,
        "updated_on": test_publication.updated_on.isoformat(),
        "created_by": test_publication.created_by,
        "created_on": test_publication.created_on.isoformat(),
        "author_ids": [],
        "author_names": [],
    }


def test_publication_not_found(client, superuser_token_headers):
    response = client.get("/api/v1/publications/123", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_unauthenticated_routes(client):
    response = client.get("/api/v1/publications")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.get("/api/v1/publications/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.put("/api/v1/publications/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = client.delete("/api/v1/publications/123")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


NEW_PUBLICATION = {
    "bad_publication": False,
    "abbreviated_title": "PUBLICATION",
    "title": "PUBLICATION_NAME_NEW",
    "updated_by": None,
    "updated_on": None,
}
UPDATE_PUBLICATION = {
    "publication": "ANOTHER_PUBLICATION",
    "title": "PUBLICATION_NAME_CHANGED",
}


def test_super_admin_permissions(
    client,
    superuser_token_headers,
    test_publication,
    test_superuser,
):
    response = client.get("/api/v1/publications", headers=superuser_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    publication_json = {
        **NEW_PUBLICATION,
        "created_by": test_superuser.user_id,
        "created_on": test_publication.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/publications", headers=superuser_token_headers, json=publication_json
    )
    assert response.status_code == status.HTTP_200_OK

    publication_json = {
        **UPDATE_PUBLICATION,
        "updated_by": test_superuser.user_id,
        "updated_on": test_publication.updated_on.isoformat(),
    }
    response = client.put(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
        json=publication_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_manager_permissions(
    client,
    manager_token_headers,
    test_publication,
    test_manager,
):
    response = client.get("/api/v1/publications", headers=manager_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    publication_json = {
        **NEW_PUBLICATION,
        "created_by": test_manager.user_id,
        "created_on": test_publication.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/publications", headers=manager_token_headers, json=publication_json
    )
    assert response.status_code == status.HTTP_200_OK

    publication_json = {
        **UPDATE_PUBLICATION,
        "updated_by": test_manager.user_id,
        "updated_on": test_publication.updated_on.isoformat(),
    }
    response = client.put(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=manager_token_headers,
        json=publication_json,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=manager_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


def test_officer_permissions(
    client,
    officer_token_headers,
    test_publication,
    test_officer,
):
    response = client.get("/api/v1/publications", headers=officer_token_headers)
    assert response.status_code == status.HTTP_200_OK

    response = client.get(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    response = client.delete(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=officer_token_headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    publication_json = {
        **NEW_PUBLICATION,
        "created_by": test_officer.user_id,
        "created_on": test_publication.created_on.isoformat(),
    }
    response = client.post(
        "/api/v1/publications", headers=officer_token_headers, json=publication_json
    )
    assert response.status_code == status.HTTP_200_OK

    publication_json.update(
        {
            **UPDATE_PUBLICATION,
            "updated_by": test_officer.user_id,
            "updated_on": test_publication.updated_on.isoformat(),
        }
    )
    response = client.put(
        f"/api/v1/publications/{test_publication.publication_id}",
        headers=officer_token_headers,
        json=publication_json,
    )
    assert response.status_code == status.HTTP_200_OK


parameter_names = "method,endpoint,status_code"

parameter_values = [
    ("get", "/api/v1/publications", status.HTTP_200_OK),
    ("post", "/api/v1/publications", status.HTTP_403_FORBIDDEN),
    ("put", "/api/v1/publications/1", status.HTTP_403_FORBIDDEN),
    ("delete", "/api/v1/publications/1", status.HTTP_403_FORBIDDEN),
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
