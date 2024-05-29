# app.py
from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)

# Load your dataframe
df = pd.read_csv('path_to_your_csv.csv')

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

    return jsonify(filtered_df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
