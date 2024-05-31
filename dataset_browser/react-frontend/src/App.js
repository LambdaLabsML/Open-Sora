import React, { useState } from 'react';
import VideoList from './VideoList';
import DatasetManager from './DatasetManager';
import './App.css';
import axios from 'axios';
import { Range, getTrackBackground } from 'react-range';

function App() {
    const [currentDatasetId, setCurrentDatasetId] = useState(null);
    const [filterValues, setFilterValues] = useState({
        num_frames: [0, 100],
        aes: [0, 10],
        aspect_ratio: [0, 5],
        fps: [0, 60],
        height: [0, 1080],
        resolution: [0, 2160],
        width: [0, 1920]
    });

    const [filters, setFilters] = useState({
        num_frames: [0, 100],
        aes: [0, 10],
        aspect_ratio: [0, 5],
        fps: [0, 60],
        height: [0, 1080],
        resolution: [0, 2160],
        width: [0, 1920],
        caption: {
            none: false,
            not_enough_information: false,
            single_image: false,
            no_movement: false,
            accepted: true
        }
    });

    const [sort, setSort] = useState('aes');
    const [order, setOrder] = useState('desc');

    const handleFilterChange = (name, values) => {
        const [minValue, maxValue] = filterValues[name];
        const [newMin, newMax] = values;
        if (newMin < minValue || newMax > maxValue || newMin > newMax) {
            console.error(`Invalid values for ${name}:`, values);
            return;
        }
        setFilters({
            ...filters,
            [name]: values
        });
    };

    const handleCheckboxChange = (e) => {
        setFilters({
            ...filters,
            caption: {
                ...filters.caption,
                [e.target.name]: e.target.checked
            }
        });
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    return (
        <div className="App">
            {currentDatasetId ? (
                <>
                    <div className="sidebar">
                        <h2>Filters</h2>
                        {Object.keys(filterValues).map((key) => (
                            <div key={key} className="range-container">
                                <label>{key.replace('_', ' ').toUpperCase()}</label>
                                {filterValues[key][0] === filterValues[key][1] ? (
                                    <div className="range-values">
                                        <span>{filterValues[key][0]}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Range
                                            step={0.1}
                                            min={filterValues[key][0]}
                                            max={filterValues[key][1]}
                                            values={filters[key]}
                                            onChange={(values) => handleFilterChange(key, values)}
                                            renderTrack={({ props, children }) => (
                                                <div
                                                    {...props}
                                                    style={{
                                                        ...props.style,
                                                        height: '6px',
                                                        width: '100%',
                                                        background: getTrackBackground({
                                                            values: filters[key],
                                                            colors: ['#555', '#BB86FC', '#555'],
                                                            min: filterValues[key][0],
                                                            max: filterValues[key][1],
                                                        }),
                                                        borderRadius: '4px',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    {children}
                                                </div>
                                            )}
                                            renderThumb={({ props, isDragged }) => (
                                                <div
                                                    {...props}
                                                    style={{
                                                        ...props.style,
                                                        height: '20px',
                                                        width: '20px',
                                                        backgroundColor: '#BB86FC',
                                                        border: '1px solid #CCC',
                                                        borderRadius: '50%',
                                                        boxShadow: '0px 2px 6px #AAA',
                                                    }}
                                                />
                                            )}
                                        />
                                        <div className="range-values">
                                            <span>Min: {Math.max(filterValues[key][0], filters[key][0]).toFixed(1)}</span>
                                            <span>Max: {Math.min(filterValues[key][1], filters[key][1]).toFixed(1)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        <div className="checkbox-container">
                            <label>CAPTION</label>
                            {Object.keys(filters.caption).map((key) => (
                                <label key={key}>
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={filters.caption[key]}
                                        onChange={handleCheckboxChange}
                                    />
                                    {key.replace('_', ' ')}
                                </label>
                            ))}
                        </div>
                        <label>
                            Sort By:
                            <select value={sort} onChange={handleSortChange}>
                                <option value="path">Filename</option>
                                <option value="num_frames">Number of Frames</option>
                                <option value="aes">AES</option>
                                <option value="aspect_ratio">Aspect Ratio</option>
                                <option value="fps">FPS</option>
                                <option value="height">Height</option>
                                <option value="resolution">Resolution</option>
                                <option value="width">Width</option>
                            </select>
                        </label>
                        <label>
                            Order:
                            <select value={order} onChange={handleOrderChange}>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </label>
                        <button onClick={() => setCurrentDatasetId(null)}>Back to Datasets</button>
                    </div>
                    <div className="main-content">
                        <VideoList datasetId={currentDatasetId} filters={filters} sort={sort} order={order} />
                    </div>
                </>
            ) : (
                <DatasetManager onSelectDataset={setCurrentDatasetId} />
            )}
        </div>
    );
}

export default App;
