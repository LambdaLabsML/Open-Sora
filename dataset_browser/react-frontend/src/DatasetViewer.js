import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterSidebar from './FilterSidebar';
import VideoList from './VideoList';

const DatasetViewer = ({ datasetId }) => {
    const [filterValues, setFilterValues] = useState({});
    const [filters, setFilters] = useState({
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
        axios.get(`${process.env.REACT_APP_API_URL}/api/datasets/${datasetId}/filters`)
            .then(response => {
                console.log('API response for filter values:', response.data);
                const filterValuesFromAPI = response.data;
                const filtersFromAPI = Object.keys(filterValuesFromAPI).reduce((acc, key) => {
                    acc[key] = [filterValuesFromAPI[key].min, filterValuesFromAPI[key].max];
                    return acc;
                }, {});

                setFilterValues(filterValuesFromAPI);
                setFilters({
                    ...filtersFromAPI,
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
        console.log(`Updating filter ${name} with values:`, values);
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: values
        }));
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

    console.log('Filter values:', filterValues);
    console.log('Filters:', filters);

    return (
        <div className="dataset-viewer">
            {Object.keys(filterValues).length > 0 && (
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
            )}
            <div className="main-content">
                <VideoList datasetId={datasetId} filters={filters} sort={sort} order={order} />
            </div>
        </div>
    );
};

export default DatasetViewer;
