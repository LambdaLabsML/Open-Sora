from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import argparse

app = Flask(__name__, static_folder='../react-frontend/build', static_url_path='/')
CORS(app)  # Enable CORS

# Argument parser
parser = argparse.ArgumentParser(description='Run Flask app with path to CSV directory')
parser.add_argument('--csv-meta-dir', type=str, required=True, help='Path to the CSV directory')
parser.add_argument('--video-clip-dir', type=str, required=True, help='Path to the video clip directory')
args = parser.parse_args()

csv_meta_dir = Path(args.csv_meta_dir)
video_clip_dir = Path(args.video_clip_dir)

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

df = load_data(csv_meta_dir)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/videos', methods=['GET'])
def get_videos():
    # Get filter and sorting parameters
    filter_params = request.args.get('filter', default='', type=str)
    sort_param = request.args.get('sort', default='', type=str)
    sort_order = request.args.get('order', default='asc', type=str)

    filtered_df = df
    if filter_params:
        for key, value in filter_params.items():
            filtered_df = filtered_df[filtered_df[key].str.contains(value)]

    if sort_param:
        filtered_df = filtered_df.sort_values(by=sort_param, ascending=(sort_order == 'asc'))

    # Replace NaN values with None
    filtered_df = filtered_df.where(pd.notnull(filtered_df), None)

    return jsonify(filtered_df.to_dict(orient='records'))

@app.route('/videos/<path:filename>')
def serve_video(filename):
    # Ensure the filename path is safe and inside the csv_meta_dir
    return send_from_directory(video_clip_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
