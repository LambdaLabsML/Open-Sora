import React from 'react';
import './App.css';
import DatasetViewer from './DatasetViewer';

function App() {
    const datasetId = "e4a3e2f6"; // Replace with your actual dataset ID or fetch it as needed

    return (
        <div className="App">
            <DatasetViewer datasetId={datasetId} />
        </div>
    );
}

export default App;
