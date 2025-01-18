import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('mongodb://localhost:27017/')
WEATHERSTACK_API_KEY = os.getenv('f6436b208f585a27cbd45a745fc322d6')

