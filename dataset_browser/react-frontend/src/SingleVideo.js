import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SingleVideo = () => {
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/videos')
            .then(response => {
                if (response.data.length > 0) {
                    const firstVideo = response.data[0];
                    setVideoUrl(`http://localhost:5000/videos/${encodeURIComponent(firstVideo.path)}`);
                }
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Single Video Test</h1>
            {videoUrl ? (
                <video width="640" height="480" controls>
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
};

export default SingleVideo;
