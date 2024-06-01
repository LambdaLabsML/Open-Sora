import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DatasetList.css';

const DatasetList = ({ onDelete }) => {
    const [datasets, setDatasets] = useState([]);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/datasets`);
            setDatasets(response.data.datasets);
        } catch (error) {
            console.error('Error fetching datasets:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/datasets/${id}`);
            onDelete(); // Call the onDelete prop to refresh the dataset list
        } catch (error) {
            console.error('Error deleting dataset:', error);
        }
    };

    return (
        <div className="dataset-list">
            <h2>Datasets</h2>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Author</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {datasets.map(dataset => (
                    <tr key={dataset.id}>
                        <td>{dataset.name}</td>
                        <td>{dataset.author}</td>
                        <td>{dataset.description}</td>
                        <td>{new Date(dataset.created_at).toLocaleString()}</td>
                        <td className="actions">
                            <button onClick={() => window.location.href = `/dataset/${dataset.id}`}>View</button>
                            <button onClick={() => handleDelete(dataset.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DatasetList;
