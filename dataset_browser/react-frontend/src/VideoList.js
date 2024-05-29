// src/VideoList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        axios.get('/videos', {
            params: {
                filter: filter,
                sort: sort,
                order: order
            }
        }).then(response => {
            setVideos(response.data);
        }).catch(error => {
            console.error('Error fetching videos:', error);
        });
    }, [filter, sort, order]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    return (
        <div>
            <div>
                <label>Filter: <input type="text" value={filter} onChange={handleFilterChange} /></label>
                <label>Sort By: <input type="text" value={sort} onChange={handleSortChange} /></label>
                <label>Order:
                    <select value={order} onChange={handleOrderChange}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </label>
            </div>
            <div>
                {videos.map(video => (
                    <div key={video.path}>
                        <video width="320" height="240" controls>
                            <source src={video.path} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div>
                            {Object.keys(video).map(key => (
                                key !== 'path' && <p key={key}>{key}: {video[key]}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoList;
