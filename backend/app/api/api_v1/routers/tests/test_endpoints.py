import pytest


@pytest.mark.parametrize(
    ("endpoint"),
    [
        ("authors"),
        ("classification_systems"),
        ("cross_references"),
        ("hierarchies"),
        ("kingdoms"),
        ("publications"),
        ("taxon_names"),
        ("taxon_ranks"),
        ("users"),
        ("vernacular"),
    ],
)
def test_item_list(client, endpoint, superuser_token_headers):
    response = client.get("/api/v1/" + endpoint, headers=superuser_token_headers)
    assert response.status_code == 200
