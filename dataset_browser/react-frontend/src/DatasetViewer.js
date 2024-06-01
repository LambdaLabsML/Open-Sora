import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterSidebar from './FilterSidebar';
import VideoList from './VideoList';

const DatasetViewer = ({ datasetId }) => {
    const [filterValues, setFilterValues] = useState({});
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('aes');
    const [order, setOrder] = useState('desc');

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/datasets/${datasetId}/filters`)
            .then(response => {
                setFilterValues(response.data);
                setFilters({
                    ...response.data,
                    caption: {
                        none: false,
                        not_enough_information: false,
                        single_image: false,
                        no_movement: false,
                        accepted: true
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching filter values:', error);
            });
    }, [datasetId]);

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
            />
            <div className="main-content">
                <VideoList datasetId={datasetId} filters={filters} sort={sort} order={order} />
            </div>
        </div>
    );
};

export default DatasetViewer;
