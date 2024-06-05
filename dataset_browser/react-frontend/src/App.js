import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DatasetList from './DatasetList';
import CreateDatasetModal from './CreateDatasetModal';
import DatasetViewer from './DatasetViewer';
import './App.css';

const App = () => {
    const [refresh, setRefresh] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = () => {
        setRefresh(!refresh);
    };

    const handleDelete = () => {
        setRefresh(!refresh);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <Router>
            <div className="App">
                <header>
                    <h1>Dataset Browser</h1>
                </header>
                <div className="app-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dataset-list-page">
                                <button className="launch-button" onClick={openModal}>Create New Dataset</button>
                                <DatasetList onDelete={handleDelete} key={refresh}/>
                                <CreateDatasetModal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreate}/>
                            </div>
                        }/>
                        <Route path="/dataset/:id" element={<DatasetViewer/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
