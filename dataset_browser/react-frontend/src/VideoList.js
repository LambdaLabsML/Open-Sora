import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VideoList.css';  // Import the CSS file

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        axios.get('http://localhost:5000/videos', {
            params: {
                filter: filter,
                sort: sort,
                order: order
            }
        }).then(response => {
            console.log('Fetched videos:', response.data);
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
                {videos.length === 0 ? (
                    <p>No videos found</p>
                ) : (
                    videos.map((video, index) => {
                        const videoUrl = `http://localhost:5000/videos/${encodeURIComponent(video.path)}`;
                        console.log(`Rendering video URL: ${videoUrl}`);
                        return (
                            <div key={`${video.path}-${index}`} className="video-container">
                                <video width="320" height="240" controls>
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="video-metadata">
                                    {Object.keys(video).map(key => (
                                        key !== 'path' && <p key={`${key}-${index}`}>{key}: {video[key]}</p>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VideoList;
