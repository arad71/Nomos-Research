from starlette import status

CURATION_ENDPOINT = "/api/v1/checklist/curation"


def test_checklist(client, test_cross_reference, test_taxon_name, checklist_api_key):
    response = client.get(
        CURATION_ENDPOINT + "?validated=true", headers={"x-api-key": checklist_api_key}
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "nomenclaturalCode": "Kingdom1",
            "scientificName": None,
            "scientificNameAuthorship": None,
            "isCurrent": True,
            "taxonRank": "Rank Name 1",
            "validated": True,
            "created": test_cross_reference.old_name.created_on.isoformat(),
            "updated": test_cross_reference.old_name.updated_on.isoformat(),
            "scientificNameId": test_cross_reference.old_name.taxon_name_id,
            "crossReferenceType": "misapplied_name",
            "crossReferenceId": 1,
            "crossReferenceCreated": test_cross_reference.created_on.isoformat(),
            "crossReferenceUpdated": test_cross_reference.updated_on.isoformat(),
            "crossReferenceActive": True,
            "acceptedNameUsage": None,
            "acceptedNameAuthor": None,
            "acceptedNameCurrent": True,
            "acceptedNameValidated": True,
            "acceptedNameCreated": test_taxon_name.created_on.isoformat(),
            "acceptedNameUpdated": test_taxon_name.created_on.isoformat(),
            "acceptedNameUsageId": test_taxon_name.taxon_name_id,
            "canonicalName": test_taxon_name.canonical_name,
            "canonicalNameWithoutRank": test_taxon_name.canonical_name_without_rank,
        }
    ]


def test_checklist_permission(client):
    response = client.get(CURATION_ENDPOINT)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.get(CURATION_ENDPOINT, headers={"x-api-key": "notapassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
