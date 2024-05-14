from flask import Flask, jsonify, request, send_from_directory
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='public')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api-key')
def get_api_key():
    api_key = os.getenv('OPENAI_API_KEY')
    return jsonify({"apiKey": api_key})

if __name__ == '__main__':
    app.run(debug=True)
