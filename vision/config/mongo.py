import logging
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL")
client = None
db = None

if MONGO_URL:
    try:
        client = MongoClient(MONGO_URL)
        db = client["qualiscan_orders"]
        logger.info("MongoDB connected successfully")
    except Exception as e:
        logger.warning("MongoDB connection failed: %s. DB features will be unavailable.", e)
else:
    logger.warning("MONGO_URL not set — database features will be unavailable")
