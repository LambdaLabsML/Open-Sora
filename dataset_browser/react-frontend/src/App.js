import React, { useState, useEffect } from 'react';
import VideoList from './VideoList';
import FilterSidebar from './FilterSidebar';
import './App.css';
import axios from 'axios';

function App() {
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

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/filters`)
            .then(response => {
                const newFilterValues = {};
                for (const key in response.data) {
                    newFilterValues[key] = [response.data[key].min, response.data[key].max];
                }
                setFilterValues(newFilterValues);
                setFilters(prevFilters => ({
                    ...prevFilters,
                    ...newFilterValues
                }));
            })
            .catch(error => {
                console.error('Error fetching filter values:', error);
            });
    }, []);

    const handleFilterChange = (name, values) => {
        // Ensure values are within the min and max range
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
            <FilterSidebar
                filterValues={filterValues}
                filters={filters}
                onFilterChange={handleFilterChange}
                onCheckboxChange={handleCheckboxChange}
                sort={sort}
                onSortChange={handleSortChange}
                order={order}
                onOrderChange={handleOrderChange}
            />
            <div className="main-content">
                <VideoList filters={filters} sort={sort} order={order} />
            </div>
        </div>
    );
}

export default App;
