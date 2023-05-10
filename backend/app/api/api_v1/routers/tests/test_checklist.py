from starlette import status

from app.db.cross_reference.model import CrossReference
from app.db.hierarchy.model import Hierarchy
from app.db.taxon_name.model import TaxonName
from app.tests.util import assert_list_dict_equal_ignoring

CURATION_ENDPOINT = "/api/v1/checklist/curation"


def test_checklist(
    client,
    test_cross_reference: CrossReference,
    test_checklist_name: TaxonName,
    test_hierarchies: dict[{str: Hierarchy}],
    test_classification_system,
    test_vernacular,
    checklist_api_key,
):
    response = client.get(
        CURATION_ENDPOINT + "?validated=true", headers={"x-api-key": checklist_api_key}
    )
    assert response.status_code == 200
    assert len(test_hierarchies) == 5

    assert_list_dict_equal_ignoring(
        [
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Carnivora",
                "canonicalName": "Carnivora",
                "canonicalNameWithoutRank": "Carnivora",
                "uninomial": "Carnivora",
                "isCurrent": True,
                "taxonRank": "Order",
                "validated": True,
                "scientificNameId": 7,
                "kingdom": "Kingdom1",
                "phylum": "Chordata",
                "class": "Mammalia",
                "order": "Carnivora",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Chordata",
                "canonicalName": "Chordata",
                "canonicalNameWithoutRank": "Chordata",
                "uninomial": "Chordata",
                "isCurrent": True,
                "taxonRank": "Phylum",
                "validated": True,
                "scientificNameId": 3,
                "kingdom": "Kingdom1",
                "phylum": "Chordata",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Animalia",
                "canonicalName": "Animalia",
                "canonicalNameWithoutRank": "Animalia",
                "uninomial": "Animalia",
                "isCurrent": True,
                "taxonRank": "Kingdom",
                "validated": True,
                "scientificNameId": 4,
                "kingdom": "Kingdom1",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Reptilia",
                "canonicalName": "Reptilia",
                "canonicalNameWithoutRank": "Reptilia",
                "uninomial": "Reptilia",
                "isCurrent": True,
                "taxonRank": "Class",
                "validated": True,
                "scientificNameId": 6,
                "kingdom": "Kingdom1",
                "phylum": "Chordata",
                "class": "Reptilia",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Mammalia",
                "canonicalName": "Mammalia",
                "canonicalNameWithoutRank": "Mammalia",
                "uninomial": "Mammalia",
                "isCurrent": True,
                "taxonRank": "Class",
                "validated": True,
                "scientificNameId": 5,
                "kingdom": "Kingdom1",
                "phylum": "Chordata",
                "class": "Mammalia",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Panthera",
                "canonicalName": "Panthera",
                "canonicalNameWithoutRank": "Panthera",
                "uninomial": "Panthera",
                "isCurrent": True,
                "taxonRank": "Genus",
                "validated": True,
                "scientificNameId": 2,
                "kingdom": "Kingdom1",
                "phylum": "Chordata",
                "class": "Mammalia",
                "order": "Carnivora",
                "genus": "Panthera",
            },
            {
                "nomenclaturalCode": "Kingdom1",
                "scientificName": "Testuninomial",
                "canonicalName": "Testuninomial",
                "canonicalNameWithoutRank": "Testuninomial",
                "uninomial": "Testuninomial",
                "establishmentMeans": "native",
                "vernacularName": ["Vernacular 1"],
                "informalGroups": ["CLASS_DESC"],
                "isCurrent": True,
                "taxonRank": "Rank Name 1",
                "validated": True,
                "scientificNameId": 1,
                "crossReferenceType": "misapplied_name",
                "crossReferenceId": "1",
                "acceptedNameUsage": "Testuninomial",
                "acceptedNameCurrent": True,
                "acceptedNameValidated": True,
                "acceptedNameUsageId": 1,
                "relatedNamesCount": 1,
                "kingdom": "Kingdom1",
            },
        ],
        response.json(),
        [
            "scientificNameId",
            "created",
            "updated",
            "crossReferenceCreated",
            "crossReferenceUpdated",
            "crossReferenceId",
            "acceptedNameCreated",
            "acceptedNameUpdated",
            "acceptedNameUsageId",
        ],
    )


def test_checklist_permission(client):
    response = client.get(CURATION_ENDPOINT)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    response = client.get(CURATION_ENDPOINT, headers={"x-api-key": "notapassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
