# conftest.py

import pytest
from app import app, initialize_dataset, load_datasets, save_datasets, dataframes, datasets
import os
import json
import pandas as pd

@pytest.fixture(scope='module')
def test_client():
    with app.test_client() as client:
        yield client

@pytest.fixture(scope='module')
def mock_dataset():
    name = 'test_dataset'
    author = 'test_author'
    csv_meta_dir = 'tests/test_data/csv_meta'
    video_clip_dir = 'tests/test_data/videos'
    description = 'A test dataset'

    dataset = initialize_dataset(name, author, csv_meta_dir, video_clip_dir, description)
    datasets[dataset['id']] = dataset
    save_datasets(datasets)
    return dataset

@pytest.fixture(scope='module')
def mock_data():
    mock_df = pd.DataFrame({
        'path': [f'video_{i}.mp4' for i in range(1, 51)],
        'text': [f'Description for video {i}' for i in range(1, 51)],
        'num_frames': [100 + i for i in range(1, 51)],
        'caption_category': ['accepted' for _ in range(50)]
    })
    return mock_df

@pytest.fixture(scope='module')
def setup_mock_data(mock_dataset, mock_data):
    dataframes[mock_dataset['id']] = mock_data
    yield
    del dataframes[mock_dataset['id']]
    del datasets[mock_dataset['id']]
    save_datasets(datasets)
