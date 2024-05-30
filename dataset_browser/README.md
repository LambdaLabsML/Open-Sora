# Dataset browser
Allows you to browse a video dataset, and view the videos and corresponding metadata

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/)

### Build the React frontend
```bash
cd react-frontend
npm ci
npm run build
```

#### If running non-locally, set the backend host URL when building, e.g:
```bash
REACT_APP_API_URL=http://192.168.48.123:5000 npm run build
````

### Start the Flask backend
```bash
cd flask-backend
pip install -r requirements.txt
python app.py \
  --csv-meta-dir <path_to_your_meta_directory> \
  --video-clip-dir <path_to_your_video_clips_directory>
```

#### Serving with Gunicorn
```bash
CSV_META_DIR=<path_to_your_meta_directory>
VIDEO_CLIP_DIR=<path_to_your_video_clips_directory>
gunicorn -w 4 -b 0.0.0.0:5000 --preload "app:create_app('$CSV_META_DIR', '$VIDEO_CLIP_DIR')"
```

## Usage
Open [http://localhost:5000](http://localhost:5000) to view the dataset browser in your browser.