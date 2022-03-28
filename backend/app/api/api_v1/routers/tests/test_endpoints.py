import pytest


@pytest.mark.parametrize(
    "endpoint",
    [
        "authors",
        "citations",
        "classification_systems",
        "cross_references",
        "hierarchies",
        "informal_groups",
        "kingdoms",
        "publications",
        "taxon_names",
        "taxon_ranks",
        "users",
        "vernaculars",
    ],
)
def test_item_list(client, endpoint, superuser_token_headers):
    response = client.get("/api/v1/" + endpoint, headers=superuser_token_headers)
    assert response.status_code == 200
