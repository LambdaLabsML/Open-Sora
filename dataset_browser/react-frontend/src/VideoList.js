import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import LazyLoad from 'react-lazyload';
import './VideoList.css';

const VideoList = ({ filters, sort, order }) => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchVideos(1, true); // Reset when filters change
    }, [filters, sort, order]);

    const fetchVideos = async (pageNumber = 1, reset = false) => {
        const captionFilters = Object.keys(filters.caption)
            .filter(key => filters.caption[key])
            .join(',');

        if (!captionFilters) {
            setVideos([]);
            setHasMore(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/videos`, {
                params: {
                    ...filters,
                    filter: '',
                    sort,
                    order,
                    page: pageNumber,
                    page_size: PAGE_SIZE,
                    caption_filters: captionFilters
                }
            });

            const { videos: fetchedVideos } = response.data;
            console.log('Fetched videos:', fetchedVideos);

            if (reset) {
                setVideos(fetchedVideos);
            } else {
                setVideos(prevVideos => [...prevVideos, ...fetchedVideos]);
            }

            if (fetchedVideos.length < PAGE_SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setPage(pageNumber);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const loadMoreVideos = () => {
        fetchVideos(page + 1);
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
                        const videoUrl = `${API_URL}/videos/${encodeURIComponent(video.path)}`;
                        const thumbnailUrl = `${API_URL}/thumbnails/${encodeURIComponent(video.path.replace('.mp4', '.jpg'))}`;
                        return (
                            <LazyLoad key={`${video.path}-${index}`} height={200} offset={100} once>
                                <div className="video-container">
                                    <div className="thumbnail-container">
                                        <img src={thumbnailUrl} alt={video.path} />
                                        <div className="play-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
                                                <path fill="rgba(255, 255, 255, 0.7)" d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    </div>
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
