from flask import Flask, jsonify, request, send_from_directory, Blueprint
from flask_cors import CORS
import pandas as pd
import argparse
import os
import cv2
from pathlib import Path
from pandarallel import pandarallel

def initialize_pandarallel():
    pandarallel.initialize(progress_bar=True)

def load_data(csv_meta_dir):
    df = pd.DataFrame()
    for csv_file in csv_meta_dir.glob('*.csv'):
        if csv_file.name in ['meta_info_fmin1_timestamp.csv', 'meta_info_fmin1.csv']:
            continue
        df2 = pd.read_csv(csv_file)
        df2.rename(columns={'video': 'path'}, inplace=True)
        if df.empty:
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

    # Calculate caption categories
    df['caption_category'] = df['text'].apply(get_caption_category)

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

def ensure_thumbnails(video_files, thumbnail_dir):
    def process_video_file(video_file):
        thumbnail_path = thumbnail_dir / f"{video_file.stem}.jpg"
        if not thumbnail_path.exists():
            create_thumbnail(video_file, thumbnail_path)

    video_files.parallel_apply(lambda video_file: process_video_file(video_file))

def get_caption_category(text):
    if not text or pd.isna(text):
        return 'none'
    if 'Not enough information' in text:
        return 'not_enough_information'
    if 'Single image' in text:
        return 'single_image'
    if 'No movement' in text:
        return 'no_movement'
    return 'accepted'


def initialize_app(csv_meta_dir, video_clip_dir):
    thumbnail_dir = video_clip_dir.parent / 'thumbnails'
    thumbnail_dir.mkdir(parents=True, exist_ok=True)

    initialize_pandarallel()

    df = load_data(csv_meta_dir)

    video_files = pd.Series(list(video_clip_dir.glob('*.mp4')))
    print(f"Generating thumbnails for {len(video_files)} video files...")
    ensure_thumbnails(video_files, thumbnail_dir)

    return df, thumbnail_dir

def create_app(csv_meta_dir, video_clip_dir):
    app = Flask(__name__, static_folder='../react-frontend/build', static_url_path='/')
    CORS(app)

    df, thumbnail_dir = initialize_app(Path(csv_meta_dir), Path(video_clip_dir))
    api = Blueprint('api', __name__)

    @api.route('/')
    def serve():
        return send_from_directory(app.static_folder, 'index.html')

    @api.route('/videos', methods=['GET'])
    def get_videos():

        # Parse filters
        filters = {}
        for key, values in request.args.items():
            if key.startswith('filters['):
                key_parts = key.split('[')
                filter_key = key_parts[1].rstrip(']')
                sub_key = key_parts[2].rstrip(']')

                if filter_key not in filters:
                    filters[filter_key] = {}

                filters[filter_key][sub_key] = values

        sort_param = request.args.get('sort', default='', type=str)
        sort_order = request.args.get('order', default='asc', type=str)
        page = request.args.get('page', default=1, type=int)
        page_size = request.args.get('page_size', default=10, type=int)
        caption_filters = request.args.get('caption_filters', default='', type=str).split(',')

        filtered_df = df.copy()

        # Apply filters
        for filter_key, sub_filters in filters.items():
            if isinstance(sub_filters, dict):
                min_val, max_val = sub_filters.get('0'), sub_filters.get('1')
                if min_val is not None and max_val is not None:
                    min_val = float(min_val)
                    max_val = float(max_val)
                    filtered_df = filtered_df[(filtered_df[filter_key] >= min_val) & (filtered_df[filter_key] <= max_val)]
            elif isinstance(sub_filters, str):
                filtered_df = filtered_df[filtered_df[filter_key].str.contains(sub_filters, case=False, na=False)]

        if caption_filters and caption_filters[0] != '':
            filtered_df = filtered_df[filtered_df['caption_category'].isin(caption_filters)]
        else:
            # set to empty dataframe if no caption filters are selected
            filtered_df = filtered_df[0:0]

        if sort_param:
            filtered_df = filtered_df.sort_values(by=sort_param, ascending=(sort_order == 'asc'))

        # Pagination
        total_videos = len(filtered_df)
        start = (page - 1) * page_size
        end = start + page_size
        paginated_df = filtered_df[start:end]

        # Replace NaN values with None
        paginated_df = paginated_df.where(pd.notnull(paginated_df), None)

        return jsonify({
            'total': total_videos,
            'page': page,
            'page_size': page_size,
            'videos': paginated_df.to_dict(orient='records')
        })

    @api.route('/filters', methods=['GET'])
    def get_filters():
        filters = {
            'num_frames': {
                'min': df['num_frames'].min(),
                'max': df['num_frames'].max()
            },
            'aes': {
                'min': df['aes'].min(),
                'max': df['aes'].max()
            },
            'aspect_ratio': {
                'min': df['aspect_ratio'].min(),
                'max': df['aspect_ratio'].max()
            },
            'fps': {
                'min': df['fps'].min(),
                'max': df['fps'].max()
            },
            'height': {
                'min': df['height'].min(),
                'max': df['height'].max()
            },
            'resolution': {
                'min': df['resolution'].min(),
                'max': df['resolution'].max()
            },
            'width': {
                'min': df['width'].min(),
                'max': df['width'].max()
            }
        }
        return jsonify(filters)

    @api.route('/thumbnails/<path:filename>')
    def serve_thumbnail(filename):
        return send_from_directory(thumbnail_dir, filename)

    @api.route('/videos/<path:filename>')
    def serve_video(filename):
        # Ensure the filename path is safe and inside the video_clip_dir
        return send_from_directory(video_clip_dir, filename)

    app.register_blueprint(api)
    return app

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run Flask app with path to CSV directory')
    parser.add_argument('--csv-meta-dir', type=str, required=True, help='Path to the CSV directory')
    parser.add_argument('--video-clip-dir', type=str, required=True, help='Path to the video clip directory')
    args = parser.parse_args()

    app = create_app(args.csv_meta_dir, args.video_clip_dir)
    app.run(host='0.0.0.0', debug=True)
