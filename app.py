from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)


client = MongoClient(os.getenv('mongodb://localhost:27017/'))
db = client['water_pollution_db']
user_data_collection = db['user_data']
hotspots_collection = db['hotspots']


WEATHERSTACK_API_KEY = os.getenv('f6436b208f585a27cbd45a745fc322d6')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/polluted-areas', methods=['POST'])
def polluted_areas():
    data = request.json
    lat, lon = float(data['lat']), float(data['lon'])  
    
   
    polluted = list(hotspots_collection.find({
        'type': 'pollution',
        'location': {
            '$near': {
                '$geometry': {
                    'type': "Point",
                    'coordinates': [lon, lat] 
                },
                '$maxDistance': 50000 
            }
        }
    }))
    
    
    for item in polluted:
        item['_id'] = str(item['_id'])
    
    return jsonify(polluted)

@app.route('/api/weather', methods=['POST'])
def weather():
    data = request.json
    lat, lon = data['lat'], data['lon']
    
   
    params = {
        'access_key': 'f6436b208f585a27cbd45a745fc322d6',
        'query': f"{lat},{lon}"
    }
    response = requests.get('http://api.weatherstack.com/current', params=params)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch weather data'}), 500

@app.route('/api/submit-location', methods=['POST'])
def submit_location():
    data = request.json
    user_data_collection.insert_one(data)
    return jsonify({'message': 'Location submitted successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)

