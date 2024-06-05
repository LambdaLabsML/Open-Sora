import React from 'react';
import { Range, getTrackBackground } from 'react-range';
import './FilterSidebar.css';

const FilterSidebar = ({ filterValues, filters, onFilterChange, onCheckboxChange, sort, onSortChange, order, onOrderChange, textFilter, onTextFilterChange }) => {

    const renderRangeSlider = (key) => {
        const values = filters[key];
        return (
            <>
                <Range
                    step={0.1}
                    min={filterValues[key].min}
                    max={filterValues[key].max}
                    values={values}
                    onChange={(values) => onFilterChange(key, values)}
                    allowOverlap={false}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: '6px',
                                width: '100%',
                                background: getTrackBackground({
                                    values: values,
                                    colors: ['#555', '#BB86FC', '#555'],
                                    min: filterValues[key].min,
                                    max: filterValues[key].max,
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
                    <span>Min: {values[0].toFixed(1)}</span>
                    <span>Max: {values[1].toFixed(1)}</span>
                </div>
            </>
        );
    };

    return (
        <div className="sidebar">
            <h2>Filters</h2>
            {Object.keys(filterValues).map((key) => (
                <div key={key} className="range-container">
                    <label>{key.replace('_', ' ').toUpperCase()}</label>
                    {filterValues[key].min === filterValues[key].max ? (
                        <div className="range-values">
                            <span>{filterValues[key].min}</span>
                        </div>
                    ) : (
                        renderRangeSlider(key)
                    )}
                </div>
            ))}
            <div className="checkbox-container">
                <label>CAPTION</label>
                {filters.caption && (
                    <>
                        <label>
                            <input
                                type="checkbox"
                                name="none"
                                checked={filters.caption.none}
                                onChange={onCheckboxChange}
                            />
                            None
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="not_enough_information"
                                checked={filters.caption.not_enough_information}
                                onChange={onCheckboxChange}
                            />
                            Not enough information
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="single_image"
                                checked={filters.caption.single_image}
                                onChange={onCheckboxChange}
                            />
                            Single image
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="no_movement"
                                checked={filters.caption.no_movement}
                                onChange={onCheckboxChange}
                            />
                            No movement
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="accepted"
                                checked={filters.caption.accepted}
                                onChange={onCheckboxChange}
                            />
                            Accepted
                        </label>
                    </>
                )}
            </div>
            <label>
                Sort By:
                <select value={sort} onChange={onSortChange}>
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
                <select value={order} onChange={onOrderChange}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </label>
            <div className="text-filter-container">
                <label>Text Filter:</label>
                <input
                    type="text"
                    value={textFilter || ''}
                    onChange={(e) => onTextFilterChange(e.target.value)}
                    placeholder="Enter text to filter"
                />
            </div>
        </div>
    );
};

export default FilterSidebar;

