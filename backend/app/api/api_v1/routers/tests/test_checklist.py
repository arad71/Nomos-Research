from starlette import status

CURATION_ENDPOINT = "/api/v1/checklist/curation"


def test_checklist(
    client,
    test_cross_reference,
    test_checklist_name,
    test_classification_system,
    test_vernacular,
    checklist_api_key,
):
    response = client.get(
        CURATION_ENDPOINT + "?validated=true", headers={"x-api-key": checklist_api_key}
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "nomenclaturalCode": "Kingdom1",
            "scientificName": "Testuninomial",
            "scientificNameAuthorship": None,
            "isCurrent": True,
            "taxonRank": "Rank Name 1",
            "establishmentMeans": "native",
            "informalGroups": [test_classification_system.class_desc],
            "vernacularNames": [test_vernacular.vernacular_name],
            "validated": True,
            "created": test_cross_reference.old_name.created_on.isoformat(),
            "updated": test_cross_reference.old_name.updated_on.isoformat(),
            "scientificNameId": test_cross_reference.old_name.taxon_name_id,
            "crossReferenceType": "misapplied_name",
            "crossReferenceId": 1,
            "crossReferenceCreated": test_cross_reference.created_on.isoformat(),
            "crossReferenceUpdated": test_cross_reference.updated_on.isoformat(),
            "acceptedNameUsage": "Testuninomial",
            "acceptedNameAuthor": None,
            "acceptedNameCurrent": True,
            "acceptedNameValidated": True,
            "acceptedNameCreated": test_checklist_name.created_on.isoformat(),
            "acceptedNameUpdated": test_checklist_name.updated_on.isoformat(),
            "acceptedNameUsageId": test_checklist_name.taxon_name_id,
            "canonicalName": test_checklist_name.canonical_name,
            "canonicalNameWithoutRank": test_checklist_name.canonical_name_without_rank,
            "relatedNamesCount": 1,
        }
    ]


def test_checklist_permission(client):
    response = client.get(CURATION_ENDPOINT)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.get(CURATION_ENDPOINT, headers={"x-api-key": "notapassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
