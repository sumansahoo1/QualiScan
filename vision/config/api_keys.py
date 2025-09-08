import os
from dotenv import load_dotenv

load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")
langchain_api_key = os.getenv("LANGCHAIN_API_KEY")
roboflow_api_key = os.getenv("ROBOFLOW_API_KEY")

if google_api_key is None or langchain_api_key is None or roboflow_api_key is None:
    raise ValueError(
        "Environment variables GOOGLE_API_KEY and LANGCHAIN_API_KEY and ROBOFLOW_API_KEY must be set"
    )

os.environ["GOOGLE_API_KEY"] = google_api_key
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = langchain_api_key
os.environ["ROBOFLOW_API_KEY"] = roboflow_api_key
