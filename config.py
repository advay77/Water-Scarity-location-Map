import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGO_DB')
WEATHERSTACK_API_KEY = os.getenv('YOUR_API_KEY')

