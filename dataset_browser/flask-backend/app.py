from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import argparse
import os
import cv2
from pandarallel import pandarallel

app = Flask(__name__, static_folder='../react-frontend/build', static_url_path='/')
CORS(app)  # Enable CORS

# Argument parser
parser = argparse.ArgumentParser(description='Run Flask app with path to CSV directory')
parser.add_argument('--csv-meta-dir', type=str, required=True, help='Path to the CSV directory')
parser.add_argument('--video-clip-dir', type=str, required=True, help='Path to the video clip directory')
args = parser.parse_args()

csv_meta_dir = Path(args.csv_meta_dir)
video_clip_dir = Path(args.video_clip_dir)
thumbnail_dir = video_clip_dir.parent / 'thumbnails'
thumbnail_dir.mkdir(parents=True, exist_ok=True)

# Initialize pandarallel
pandarallel.initialize(progress_bar=True)

def load_data(csv_meta_dir):
    df = pd.DataFrame()
    for csv_file in csv_meta_dir.glob('*.csv'):
        if csv_file.name in ['meta_info_fmin1_timestamp.csv', 'meta_info_fmin1.csv']:
            continue
        df2 = pd.read_csv(csv_file)
        df2.rename(columns={'video': 'path'}, inplace=True)
        if len(df) == 0:
            df = df2
        else:
            df = pd.merge(df, df2, on='path', how='outer', suffixes=('', '_duplicate'))
            # Drop duplicate columns
            for column in df.columns:
                if column.endswith('_duplicate'):
                    df.drop(columns=[column], inplace=True)
    df.dropna(subset=['num_frames'], inplace=True)

    # Convert paths to be relative to the video_clip_dir
    df['path'] = df['path'].apply(lambda x: Path(x).name)

    return df

def create_thumbnail(video_path, thumbnail_path):
    try:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            print(f"Error opening video file {video_path}")
            return

        # Get the total number of frames
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        middle_frame = total_frames // 2

        # Set the frame position to the middle frame
        cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)

        # Read the frame
        ret, frame = cap.read()
        if ret:
            # Downscale the frame if the width is greater than 640
            height, width, _ = frame.shape
            if width > 640:
                scaling_factor = 640 / width
                new_width = 640
                new_height = int(height * scaling_factor)
                frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)

            # Save the frame as an image
            cv2.imwrite(str(thumbnail_path), frame)
        cap.release()
    except Exception as e:
        print(f"Error creating thumbnail for {video_path}: {e}")

def ensure_thumbnails(video_files):
    def process_video_file(video_file):
        thumbnail_path = thumbnail_dir / f"{video_file.stem}.jpg"
        if not thumbnail_path.exists():
            create_thumbnail(video_file, thumbnail_path)

    video_files.parallel_apply(lambda video_file: process_video_file(video_file))

# Load data
df = load_data(csv_meta_dir)

# Ensure thumbnails are created
video_files = pd.Series(list(video_clip_dir.glob('*.mp4')))
print(f"Generating thumbnails for {len(video_files)} video files...")
ensure_thumbnails(video_files)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/videos', methods=['GET'])
def get_videos():
    # Get filter and sorting parameters
    filter_params = request.args.get('filter', default='', type=str)
    sort_param = request.args.get('sort', default='', type=str)
    sort_order = request.args.get('order', default='asc', type=str)
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=10, type=int)

    filtered_df = df
    if filter_params:
        for key, value in filter_params.items():
            filtered_df = filtered_df[filtered_df[key].str.contains(value, case=False)]

    if sort_param:
        filtered_df = filtered_df.sort_values(by=sort_param, ascending=(sort_order == 'asc'))

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = filtered_df[start:end]

    # Replace NaN values with None
    paginated_df = paginated_df.where(pd.notnull(paginated_df), None)

    return jsonify(paginated_df.to_dict(orient='records'))

@app.route('/thumbnails/<path:filename>')
def serve_thumbnail(filename):
    return send_from_directory(thumbnail_dir, filename)

@app.route('/videos/<path:filename>')
def serve_video(filename):
    # Ensure the filename path is safe and inside the video_clip_dir
    return send_from_directory(video_clip_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
