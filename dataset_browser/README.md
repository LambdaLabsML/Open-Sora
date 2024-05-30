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

### Start the Flask backend
```bash
cd flask-backend
pip install -r requirements.txt
python app.py \
  --csv-meta-dir <path_to_your_meta_directory> \
  --video-clip-dir <path_to_your_video_clips_directory>
```

## Usage
Open [http://localhost:5000](http://localhost:5000) to view the dataset browser in your browser.