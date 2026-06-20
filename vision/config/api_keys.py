import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

google_api_key = os.getenv("GOOGLE_API_KEY")
langchain_api_key = os.getenv("LANGCHAIN_API_KEY")
roboflow_api_key = os.getenv("ROBOFLOW_API_KEY")

if not google_api_key:
    logger.warning("GOOGLE_API_KEY not set — Google Generative AI features will fail")
else:
    os.environ["GOOGLE_API_KEY"] = google_api_key

if not langchain_api_key:
    logger.warning("LANGCHAIN_API_KEY not set — LangChain tracing will be disabled")
else:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = langchain_api_key

if not roboflow_api_key:
    logger.warning("ROBOFLOW_API_KEY not set — Roboflow inference will fail")
else:
    os.environ["ROBOFLOW_API_KEY"] = roboflow_api_key
