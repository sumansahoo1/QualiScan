import os

IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]

MODEL_NAMES = {
    "GEMINI_FLASH": "gemini-2.5-flash",
    "GEMINI_FLASH_LITE": "gemini-2.5-flash-lite",
}

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp")
