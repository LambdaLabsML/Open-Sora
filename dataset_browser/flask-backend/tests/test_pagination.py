# test_pagination.py

import pytest

def test_pagination(test_client, mock_dataset, setup_mock_data):
    dataset_id = mock_dataset['id']

    # Test first page
    response = test_client.get(f'/api/datasets/{dataset_id}/videos?page=1&page_size=10')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['videos']) == 10
    assert data['page'] == 1
    assert data['page_size'] == 10
    assert data['total'] == 50

    # Test second page
    response = test_client.get(f'/api/datasets/{dataset_id}/videos?page=2&page_size=10')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['videos']) == 10
    assert data['page'] == 2
    assert data['page_size'] == 10
    assert data['total'] == 50

    # Test page size change
    response = test_client.get(f'/api/datasets/{dataset_id}/videos?page=1&page_size=20')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['videos']) == 20
    assert data['page'] == 1
    assert data['page_size'] == 20
    assert data['total'] == 50

    # Test out of range page
    response = test_client.get(f'/api/datasets/{dataset_id}/videos?page=10&page_size=10')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['videos']) == 0
    assert data['page'] == 10
    assert data['page_size'] == 10
    assert data['total'] == 50
