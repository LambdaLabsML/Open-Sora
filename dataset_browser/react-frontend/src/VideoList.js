import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import LazyLoad from 'react-lazyload';
import './VideoList.css';

const VideoList = ({ datasetId, filters, sort, order }) => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [playingVideo, setPlayingVideo] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;
    const PAGE_SIZE = 10;

    const fetchVideos = (pageNumber = 1) => {
        const captionFilters = Object.keys(filters.caption)
            .filter(key => filters.caption[key])
            .join(',');

        setLoading(true);

        const params = new URLSearchParams();
        for (const key in filters) {
            if (key !== 'caption') {
                params.append(`filters[${key}][0]`, filters[key][0]);
                params.append(`filters[${key}][1]`, filters[key][1]);
            }
        }
        params.append('sort', sort);
        params.append('order', order);
        params.append('page', pageNumber);
        params.append('page_size', PAGE_SIZE);
        params.append('caption_filters', captionFilters);

        axios.get(`${API_URL}/api/datasets/${datasetId}/videos`, { params })
            .then(response => {
                const newVideos = response.data.videos;
                setVideos(prevVideos => pageNumber === 1 ? newVideos : [...prevVideos, ...newVideos]);
                setHasMore(newVideos.length === PAGE_SIZE);
                setPage(pageNumber);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVideos(1);
    }, [filters, sort, order]);

    const loadMoreVideos = () => {
        fetchVideos(page + 1);
    };

    const handleThumbnailClick = (videoUrl) => {
        setPlayingVideo(videoUrl);
    };

    return (
        <div className="video-list-container">
            <InfiniteScroll
                dataLength={videos.length}
                next={loadMoreVideos}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p style={{ textAlign: 'center' }}><b>Yay! You have seen it all</b></p>}
            >
                {videos.length === 0 ? (
                    <p>No videos found</p>
                ) : (
                    videos.map((video, index) => {
                        const videoUrl = `${API_URL}/api/datasets/${datasetId}/videos/${encodeURIComponent(video.path)}`;
                        const thumbnailUrl = `${API_URL}/api/datasets/${datasetId}/thumbnails/${encodeURIComponent(video.path.replace('.mp4', '.jpg'))}`;
                        return (
                            <LazyLoad key={`${video.path}-${index}`} height={200} offset={100} once>
                                <div className="video-container" onClick={() => handleThumbnailClick(videoUrl)}>
                                    {playingVideo === videoUrl ? (
                                        <video width="100%" controls autoPlay className="video-player">
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div className="thumbnail-container">
                                            <img
                                                src={thumbnailUrl}
                                                alt={video.path}
                                                width="100%"
                                                height="auto"
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
            </InfiniteScroll>
        </div>
    );
};

export default VideoList;
