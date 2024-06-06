from flask import Flask, jsonify, request, send_from_directory, Blueprint
from flask_cors import CORS
import pandas as pd
import os
import cv2
from pathlib import Path
from pandarallel import pandarallel
import uuid
from datetime import datetime
import json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("app.log"),
                        logging.StreamHandler()
                    ])

# Create a logger
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../react-frontend/build', static_url_path='/')
CORS(app)

DATASETS_FILE = 'datasets.json'

# Dictionary to hold dataframes in memory
dataframes = {}
datasets = {}

def load_datasets():
    if not os.path.exists(DATASETS_FILE):
        logger.debug("load_datasets - datasets.json file not found")
        return {}
    with open(DATASETS_FILE, 'r') as f:
        datasets = json.load(f)
        logger.debug(f"load_datasets - {len(datasets)} records loaded from'{Path(DATASETS_FILE).absolute()}'")
        # Load dataframes into memory
        for dataset in datasets.values():
            csv_meta_dir = dataset['csv_meta_dir']
            dataframes[dataset['id']] = load_data(csv_meta_dir)
        return datasets

def save_datasets(datasets):
    with open(DATASETS_FILE, 'w') as f:
        json.dump(datasets, f, indent=4)
        logger.debug(f"save_datasets - {len(datasets)} records saved to'{Path(DATASETS_FILE).absolute()}'")

def initialize_pandarallel():
    pandarallel.initialize(progress_bar=True)

def load_data(csv_meta_dir):
    logger.debug(f"load_data(csv_meta_dir={csv_meta_dir})")
    df = pd.DataFrame()

    for csv_file in Path(csv_meta_dir).glob('*.csv'):
        if csv_file.name in ['meta_info_fmin1_timestamp.csv', 'meta_info_fmin1.csv']:
            continue
        df2 = pd.read_csv(csv_file)
        df2.rename(columns={'video': 'path'}, inplace=True)
        df2['source'] = csv_file.stem

        if df.empty:
            df = df2
        else:
            df = pd.merge(df, df2, on='path', how='outer', suffixes=('', '_duplicate'))

            # Combine the source columns
            if 'source_duplicate' in df.columns:
                df['source'] = df[['source', 'source_duplicate']].apply(lambda x: ', '.join(filter(pd.notna, x)), axis=1)
                df.drop(columns=['source_duplicate'], inplace=True)

            # Combine non-NA values from duplicate columns
            for column in df.columns:
                if column.endswith('_duplicate'):
                    original_column = column.replace('_duplicate', '')
                    df[original_column] = df[original_column].combine_first(df[column])
                    df.drop(columns=[column], inplace=True)

    if 'num_frames' in df.columns:
        df.dropna(subset=['num_frames'], inplace=True)

    df['path'] = df['path'].apply(lambda x: Path(x).name)
    df['caption_category'] = df['text'].apply(get_caption_category)

    if 'aes' not in df.columns:
        df['aes'] = None

    return df

def create_thumbnail(video_path, thumbnail_path):
    if os.path.exists(thumbnail_path):
        return

    try:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            print(f"Error opening video file {video_path}")
            return
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        middle_frame = total_frames // 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
        ret, frame = cap.read()
        if ret:
            height, width, _ = frame.shape
            if width > 640:
                scaling_factor = 640 / width
                new_width = 640
                new_height = int(height * scaling_factor)
                frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
            cv2.imwrite(str(thumbnail_path), frame)
        cap.release()
    except Exception as e:
        print(f"Error creating thumbnail for {video_path}: {e}")

def ensure_thumbnails(video_files, thumbnail_dir):
    logger.debug(f"ensure_thumbnails(len(video_files)={len(video_files)}, thumbnail_dir={thumbnail_dir})")
    video_files.parallel_apply(lambda video_file: create_thumbnail(video_file, thumbnail_dir / f"{video_file.stem}.jpg"))

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

def initialize_dataset(name, author, csv_meta_dir, video_clip_dir, description=''):
    logger.debug(f"initialize_dataset(name={name}, author={author}, csv_meta_dir={csv_meta_dir}, video_clip_dir={video_clip_dir}, description={description})")
    _id = str(uuid.uuid4())[:8]
    thumbnail_dir = Path(video_clip_dir).parent / f'thumbnails_{name}'
    thumbnail_dir.mkdir(parents=True, exist_ok=True)

    initialize_pandarallel()
    df = load_data(Path(csv_meta_dir))
    dataframes[_id] = df  # Store dataframe in memory

    video_files = pd.Series(list(Path(video_clip_dir).glob('*.mp4')))
    ensure_thumbnails(video_files, thumbnail_dir)

    dataset = {
        'id': _id,
        'name': name,
        'author': author,
        'csv_meta_dir': csv_meta_dir,
        'video_clip_dir': video_clip_dir,
        'thumbnail_dir': str(thumbnail_dir),
        'created_at': datetime.utcnow().isoformat(),
        'description': description,
        'status': 'created'
    }

    datasets[_id] = dataset
    save_datasets(datasets)

    return dataset

api = Blueprint('api', __name__)

@api.route('/datasets', methods=['GET'])
def get_datasets():
    global datasets
    datasets = load_datasets()  # Refresh datasets on each call
    return jsonify({'datasets': list(datasets.values())})

@api.route('/datasets', methods=['POST'])
def create_dataset():
    data = request.json
    name = data['name']
    author = data['author']
    csv_meta_dir = data['csv_meta_dir']
    video_clip_dir = data['video_clip_dir']
    description = data.get('description', '')
    dataset = initialize_dataset(name, author, csv_meta_dir, video_clip_dir, description)
    return jsonify({'message': 'Dataset created', 'dataset': dataset})

@api.route('/datasets/<_id>', methods=['DELETE'])
def delete_dataset(_id):
    if _id in datasets:
        del datasets[_id]
        if _id in dataframes:
            del dataframes[_id]
        save_datasets(datasets)
        return jsonify({'message': 'Dataset deleted successfully'}), 200
    else:
        return jsonify({'error': 'Dataset not found'}), 404

@api.route('/datasets/<_id>/videos', methods=['GET'])
def get_videos(_id):
    if _id not in datasets or datasets[_id]['status'] != 'created':
        return jsonify({'error': 'Dataset not found or not yet created'}), 404
    df = dataframes[_id]  # Use the dataframe stored in memory
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
    caption_filters = request.args.get('caption_filters', default='accepted', type=str).split(',')
    text_filter = request.args.get('text_filter', default='', type=str)
    logger.debug(f"get_videos(_id={_id}) - filters={filters}, sort_param={sort_param}, sort_order={sort_order}, page={page}, page_size={page_size}, caption_filters={caption_filters}, text_filter={text_filter}")
    filtered_df = df.copy()
    for filter_key, sub_filters in filters.items():
        if isinstance(sub_filters, dict):
            min_val, max_val = sub_filters.get('0'), sub_filters.get('1')
            if min_val is not None and max_val is not None:
                min_val = float(min_val)
                max_val = float(max_val)
                filtered_df = filtered_df[(filtered_df[filter_key] >= min_val) & (filtered_df[filter_key] <= max_val)]
        elif isinstance(sub_filters, str):
            filtered_df = filtered_df[filter_key].str.contains(sub_filters, case=False, na=False)
    if caption_filters and caption_filters[0] != '':
        filtered_df = filtered_df[filtered_df['caption_category'].isin(caption_filters)]
    else:
        filtered_df = filtered_df[0:0]
    if text_filter:
        filtered_df = filtered_df[filtered_df['text'].str.contains(text_filter, case=False, na=False)]
    if sort_param:
        filtered_df = filtered_df.sort_values(by=sort_param, ascending=(sort_order == 'asc'))
    total_videos = len(filtered_df)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = filtered_df[start:end]
    paginated_df = paginated_df.where(pd.notnull(paginated_df), None)
    return jsonify({
        'total': total_videos,
        'page': page,
        'page_size': page_size,
        'videos': paginated_df.to_dict(orient='records')
    })


@api.route('/datasets/<_id>/filters', methods=['GET'])
def get_filters(_id):
    if _id not in datasets or datasets[_id]['status'] != 'created':
        return jsonify({'error': 'Dataset not found or not yet created'}), 404
    df = dataframes[_id]  # Use the dataframe stored in memory
    filters = {}
    if 'num_frames' in df.columns:
        filters['num_frames'] = {'min': int(df['num_frames'].min()), 'max': int(df['num_frames'].max())}
    else:
        filters['num_frames'] = {'min': -1, 'max': -1}

    if 'aes' in df.columns:
        filters['aes'] = {'min': df['aes'].min(), 'max': df['aes'].max()}
    else:
        filters['aes'] = {'min': -1, 'max': -1}

    if 'aspect_ratio' in df.columns:
        filters['aspect_ratio'] = {'min': df['aspect_ratio'].min(), 'max': df['aspect_ratio'].max()}
    else:
        filters['aspect_ratio'] = {'min': -1, 'max': -1}

    if 'fps' in df.columns:
        filters['fps'] = {'min': df['fps'].min(), 'max': df['fps'].max()}
    else:
        filters['fps'] = {'min': -1, 'max': -1}

    if 'height' in df.columns:
        filters['height'] = {'min': int(df['height'].min()), 'max': int(df['height'].max())}
    else:
        filters['height'] = {'min': -1, 'max': -1}

    if 'resolution' in df.columns:
        filters['resolution'] = {'min': int(df['resolution'].min()), 'max': int(df['resolution'].max())}
    else:
        filters['resolution'] = {'min': -1, 'max': -1}

    if 'width' in df.columns:
        filters['width'] = {'min': int(df['width'].min()), 'max': int(df['width'].max())}
    else:
        filters['width'] = {'min': -1, 'max': -1}

    return jsonify(filters)

@api.route('/datasets/<_id>/thumbnails/<path:filename>')
def serve_thumbnail(_id, filename):
    if _id not in datasets or datasets[_id]['status'] != 'created':
        return jsonify({'error': 'Dataset not found or not yet created'}), 404
    return send_from_directory(datasets[_id]['thumbnail_dir'], filename)

@api.route('/datasets/<_id>/videos/<path:filename>')
def serve_video(_id, filename):
    if _id not in datasets or datasets[_id]['status'] != 'created':
        return jsonify({'error': 'Dataset not found or not yet created'}), 404
    return send_from_directory(datasets[_id]['video_clip_dir'], filename)

app.register_blueprint(api, url_prefix='/api')

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    datasets = load_datasets()  # Load datasets and dataframes when starting the app
    app.run(host='0.0.0.0', debug=True)
