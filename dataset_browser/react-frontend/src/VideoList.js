import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import LazyLoad from 'react-lazyload';
import './VideoList.css';

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchVideos();
    }, [filter, sort, order]);

    const fetchVideos = (pageNumber = 1) => {
        axios.get(`${API_URL}/videos`, {
            params: { filter, sort, order, page: pageNumber, page_size: PAGE_SIZE }
        })
            .then(response => {
                if (response.data.length < PAGE_SIZE) {
                    setHasMore(false);
                }
                if (pageNumber === 1) {
                    setVideos(response.data);
                } else {
                    setVideos(prevVideos => [...prevVideos, ...response.data]);
                }
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    };

    const loadMoreVideos = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVideos(nextPage);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1);  // Reset to first page on filter change
        setHasMore(true);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    const handleThumbnailClick = (videoUrl) => {
        setPlayingVideo(videoUrl);
    };

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
            <InfiniteScroll
                dataLength={videos.length}
                next={loadMoreVideos}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p style={{ textAlign: 'center' }}><b>Yay! You have seen it all</b></p>}
            >
                <div>
                    {videos.length === 0 ? (
                        <p>No videos found</p>
                    ) : (
                        videos.map((video, index) => {
                            const videoUrl = `${API_URL}/videos/${encodeURIComponent(video.path)}`;
                            const thumbnailUrl = `${API_URL}/thumbnails/${encodeURIComponent(video.path.replace('.mp4', '.jpg'))}`;
                            return (
                                <LazyLoad key={`${video.path}-${index}`} height={200} offset={100} once>
                                    <div className="video-container" onClick={() => handleThumbnailClick(videoUrl)}>
                                        {playingVideo === videoUrl ? (
                                            <video
                                                width="100%"
                                                controls
                                                autoPlay
                                                style={{ aspectRatio: `${video.width} / ${video.height}` }}
                                            >
                                                <source src={videoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <div className="thumbnail-container">
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={video.path}
                                                    style={{ aspectRatio: `${video.width} / ${video.height}` }}
                                                />
                                                <div className="play-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
                                                        <path fill="rgba(255, 255, 255, 0.7)" d="M8 5v14l11-7z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
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
                                </LazyLoad>
                            );
                        })
                    )}
                </div>
            </InfiniteScroll>
        </div>
    );
};

export default VideoList;
