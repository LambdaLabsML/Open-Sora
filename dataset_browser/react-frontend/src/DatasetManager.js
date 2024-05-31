import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DatasetManager.css';

const DatasetManager = ({ onSelectDataset }) => {
    const [datasets, setDatasets] = useState([]);
    const [newDataset, setNewDataset] = useState({
        name: '',
        author: '',
        csv_meta_dir: '',
        video_clip_dir: '',
        description: ''
    });

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/datasets`)
            .then(response => {
                setDatasets(response.data);
            })
            .catch(error => {
                console.error('Error fetching datasets:', error);
            });
    };

    const handleChange = (e) => {
        setNewDataset({
            ...newDataset,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateDataset = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/datasets`, newDataset)
            .then(response => {
                fetchDatasets();
                setNewDataset({
                    name: '',
                    author: '',
                    csv_meta_dir: '',
                    video_clip_dir: '',
                    description: ''
                });
            })
            .catch(error => {
                console.error('Error creating dataset:', error);
            });
    };

    const handleDeleteDataset = (id) => {
        axios.delete(`${process.env.REACT_APP_API_URL}/api/datasets/${id}`)
            .then(response => {
                fetchDatasets();
            })
            .catch(error => {
                console.error('Error deleting dataset:', error);
            });
    };

    return (
        <div className="dataset-manager">
            <h2>Datasets</h2>
            <div className="dataset-list">
                {datasets.map((dataset) => (
                    <div key={dataset._id} className="dataset-item">
                        <div>
                            <strong>{dataset.name}</strong> by {dataset.author}
                            <p>{dataset.description}</p>
                        </div>
                        <div className="dataset-actions">
                            <button onClick={() => onSelectDataset(dataset._id)}>Open</button>
                            <button onClick={() => handleDeleteDataset(dataset._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <h3>Create New Dataset</h3>
            <div className="new-dataset-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newDataset.name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="author"
                    placeholder="Author"
                    value={newDataset.author}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="csv_meta_dir"
                    placeholder="CSV Meta Directory"
                    value={newDataset.csv_meta_dir}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="video_clip_dir"
                    placeholder="Video Clip Directory"
                    value={newDataset.video_clip_dir}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={newDataset.description}
                    onChange={handleChange}
                />
                <button onClick={handleCreateDataset}>Create Dataset</button>
            </div>
        </div>
    );
};

export default DatasetManager;
