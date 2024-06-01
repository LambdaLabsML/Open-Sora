import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './CreateDatasetModal.css';

Modal.setAppElement('#root');

const CreateDatasetModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [csvMetaDir, setCsvMetaDir] = useState('');
    const [videoClipDir, setVideoClipDir] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newDataset = {
            name,
            author,
            csv_meta_dir: csvMetaDir,
            video_clip_dir: videoClipDir,
            description
        };
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/datasets`, newDataset);
            onCreate();
            onClose();
        } catch (error) {
            console.error('Error creating dataset:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="Modal" overlayClassName="Overlay">
            <h2>Create New Dataset</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>
                    Author:
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label>
                    CSV Meta Directory:
                    <input type="text" value={csvMetaDir} onChange={(e) => setCsvMetaDir(e.target.value)} required />
                </label>
                <label>
                    Video Clip Directory:
                    <input type="text" value={videoClipDir} onChange={(e) => setVideoClipDir(e.target.value)} required />
                </label>
                <label>
                    Description:
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <div className="button-container">
                    <button type="submit">Create</button>
                    <button type="button" className="close-button" onClick={onClose}>Close</button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateDatasetModal;
