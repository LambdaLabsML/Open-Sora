import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FilterSidebar from './FilterSidebar';
import VideoList from './VideoList';
import './DatasetViewer.css';

const DatasetViewer = () => {
    const { id } = useParams(); // Use the useParams hook to get the id from the route
    const [filterValues, setFilterValues] = useState({});
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('aes');
    const [order, setOrder] = useState('desc');
    const [textFilter, setTextFilter] = useState('');

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/datasets/${id}/filters`)
            .then(response => {
                const newFilterValues = {};
                const initialFilters = {};
                for (const key in response.data) {
                    newFilterValues[key] = { min: response.data[key].min, max: response.data[key].max };
                    initialFilters[key] = [response.data[key].min, response.data[key].max];
                }
                initialFilters.caption = {
                    none: false,
                    not_enough_information: false,
                    single_image: false,
                    no_movement: false,
                    accepted: true
                };
                setFilterValues(newFilterValues);
                setFilters(initialFilters);
            })
            .catch(error => {
                console.error('Error fetching filter values:', error);
            });
    }, [id]);

    const handleFilterChange = (name, values) => {
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

    const handleTextFilterChange = (value) => {
        setTextFilter(value);
    };

    return (
        <div className="dataset-viewer">
            <FilterSidebar
                filterValues={filterValues}
                filters={filters}
                onFilterChange={handleFilterChange}
                onCheckboxChange={handleCheckboxChange}
                sort={sort}
                onSortChange={handleSortChange}
                order={order}
                onOrderChange={handleOrderChange}
                textFilter={textFilter}
                onTextFilterChange={handleTextFilterChange}
            />
            <div className="main-content">
                <VideoList datasetId={id} filters={filters} sort={sort} order={order} textFilter={textFilter} />
            </div>
        </div>
    );
};

export default DatasetViewer;

