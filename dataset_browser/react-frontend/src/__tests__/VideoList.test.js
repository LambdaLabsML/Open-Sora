import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import VideoList from '../VideoList';

// Mock LazyLoad component
jest.mock('react-lazyload', () => ({ children }) => children);

// Mock InfiniteScroll component to directly call next function
jest.mock('react-infinite-scroll-component', () => {
    const React = require('react');
    return ({ children, next, hasMore }) => {
        React.useEffect(() => {
            next();
        }, []);
        return (
            <div>
                {children}
                {hasMore && <div>Loading...</div>}
            </div>
        );
    };
});

jest.mock('axios');

const mockVideosPage1 = [
    { path: 'video1.mp4', aes: 10, aspect_ratio: 1.78, fps: 30, height: 1080, num_frames: 3000, resolution: '1920x1080', text: 'Sample text 1', width: 1920 },
    { path: 'video2.mp4', aes: 12, aspect_ratio: 1.78, fps: 30, height: 1080, num_frames: 3000, resolution: '1920x1080', text: 'Sample text 2', width: 1920 },
    // Add more videos as needed to make up a full page
];

const mockVideosPage2 = [
    { path: 'video3.mp4', aes: 8, aspect_ratio: 1.78, fps: 30, height: 1080, num_frames: 3000, resolution: '1920x1080', text: 'Sample text 3', width: 1920 },
    { path: 'video4.mp4', aes: 9, aspect_ratio: 1.78, fps: 30, height: 1080, num_frames: 3000, resolution: '1920x1080', text: 'Sample text 4', width: 1920 },
    // Add more videos as needed to make up a full page
];

beforeAll(() => {
    axios.defaults.baseURL = 'http://localhost:3000';
});

test('renders VideoList and fetches data with pagination', async () => {
    axios.get.mockImplementation((url, { params }) => {
        if (params.page === 1) {
            return Promise.resolve({ data: { videos: mockVideosPage1 } });
        } else if (params.page === 2) {
            return Promise.resolve({ data: { videos: mockVideosPage2 } });
        }
        return Promise.resolve({ data: { videos: [] } });
    });

    render(<VideoList datasetId={1} filters={{}} sort="aes" order="desc" textFilter="" />);

    // Check if initial videos are rendered
    const initialVideoElements = await screen.findAllByRole('img');
    console.log('Initial video elements:', initialVideoElements);
    expect(initialVideoElements).toHaveLength(mockVideosPage1.length);

    // Check if the next set of videos are rendered
    await waitFor(() => {
        const moreVideoElements = screen.getAllByRole('img');
        console.log('Loaded more video elements:', moreVideoElements);
        expect(moreVideoElements).toHaveLength(mockVideosPage1.length + mockVideosPage2.length);
    });
});
