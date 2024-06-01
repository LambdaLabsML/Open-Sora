import React, { useState } from 'react';
import axios from 'axios';

const CreateDatasetForm = ({ onCreate }) => {
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [csvMetaDir, setCsvMetaDir] = useState('');
    const [videoClipDir, setVideoClipDir] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDataset = { name, author, csv_meta_dir: csvMetaDir, video_clip_dir: videoClipDir, description };
        axios.post(`${process.env.REACT_APP_API_URL}/api/datasets`, newDataset)
            .then(() => {
                setName('');
                setAuthor('');
                setCsvMetaDir('');
                setVideoClipDir('');
                setDescription('');
                onCreate();
            })
            .catch(error => {
                console.error('Error creating dataset:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create New Dataset</h2>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Author:</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div>
                <label>CSV Meta Directory:</label>
                <input type="text" value={csvMetaDir} onChange={(e) => setCsvMetaDir(e.target.value)} required />
            </div>
            <div>
                <label>Video Clip Directory:</label>
                <input type="text" value={videoClipDir} onChange={(e) => setVideoClipDir(e.target.value)} required />
            </div>
            <div>
                <label>Description:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <button type="submit">Create</button>
        </form>
    );
};

export default CreateDatasetForm;
