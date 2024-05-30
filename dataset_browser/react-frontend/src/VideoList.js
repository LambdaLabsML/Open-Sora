import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VideoList.css';  // Import the CSS file

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        axios.get('http://localhost:5000/videos')
            .then(response => {
                setVideos(response.data);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }, []);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    const filteredVideos = videos.filter(video =>
        video.path.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        if (sort) {
            if (order === 'asc') {
                return a[sort] > b[sort] ? 1 : -1;
            } else {
                return a[sort] < b[sort] ? 1 : -1;
            }
        }
        return 0;
    });

    return (
        <div className="container">
            <h1>Video Clips</h1>
            <div className="filter-container">
                <label>
                    Filter:
                    <input
                        type="text"
                        value={filter}
                        onChange={handleFilterChange}
                        placeholder="Search by filename"
                    />
                </label>
                <label>
                    Sort By:
                    <select value={sort} onChange={handleSortChange}>
                        <option value="">None</option>
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
            </div>
            <div>
                {sortedVideos.length === 0 ? (
                    <p>No videos found</p>
                ) : (
                    sortedVideos.map((video, index) => {
                        const videoUrl = `http://localhost:5000/videos/${encodeURIComponent(video.path)}`;
                        return (
                            <div key={`${video.path}-${index}`} className="video-container">
                                <video width="640" height={`${video.height * 640 / video.width}`} controls>
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="video-metadata">
                                    <p className="metadata-item"><span>Filename:</span> {video.path}</p>
                                    <p className="metadata-item"><span>AES:</span> {video.aes}</p>
                                    <p className="metadata-item"><span>Aspect Ratio:</span> {video.aspect_ratio}</p>
                                    <p className="metadata-item"><span>FPS:</span> {video.fps}</p>
                                    <p className="metadata-item"><span>Height:</span> {video.height}</p>
                                    <p className="metadata-item"><span>Number of Frames:</span> {video.num_frames}</p>
                                    <p className="metadata-item"><span>Resolution:</span> {video.resolution}</p>
                                    <p className="metadata-item"><span>Text:</span> {video.text}</p>
                                    <p className="metadata-item"><span>Width:</span> {video.width}</p>
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
