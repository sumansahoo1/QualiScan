# QualiScan

This project uses a Vision Transformer Model to detect the ripeness and freshness of fruits (Banana, Apple, Orange) in images and recognize FMCG products. The frontend is built with React, Vite, Mantine UI, and Tailwind CSS, while the backend uses FastAPI with LangChain/Google Generative AI for image processing and OCR.

## Project Structure

```
QualiScan/
├── main.py                     # FastAPI app entry point
├── requirements.txt
├── .env.example                # Template for environment variables
├── .env                        # Your actual env vars (create from .env.example)
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Routes & app shell
│   │   ├── index.css
│   │   ├── output.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── ImageCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Test.jsx
│   │   └── constants/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── vision/
│   ├── __init__.py
│   ├── middleware.py            # CORS middleware
│   ├── routes.py               # API routes (/health, /orders, /process-ocr)
│   ├── constants.py             # Image types, model names, temp dir
│   ├── config/
│   │   ├── api_keys.py         # API key loading from .env
│   │   ├── celery_worker.py    # Celery app definition
│   │   ├── logging_config.py   # Logging formatter
│   │   ├── mongo.py            # MongoDB connection
│   │   └── roboflow.py         # Roboflow inference client
│   ├── utils/
│   │   ├── db_operations.py    # Order ID generation & log storage
│   │   ├── image_processing.py # Segmentation & bounding boxes
│   │   ├── llm_invoke.py       # LangChain Gemini invoker
│   │   ├── sanitize.py         # JSON parsing utilities
│   │   └── prompt/
│   │       ├── load_prompt.py
│   │       └── input_prompt.txt
│   └── tasks/
│       └── process_ocr_task.py # Celery OCR processing task
└── dataset/
```

## Prerequisites

- **Conda** (Miniconda/Anaconda)
- **Node.js** ≥ 18 + **pnpm** (≥ 9.0)
- **Redis** (for Celery background tasks — optional if not using OCR processing)

## Installation

### 1. Conda Environment

```sh
conda create -n qualiscan python=3.10
conda activate qualiscan
```

### 2. Install Python Dependencies

Install backend packages:

```sh
pip install fastapi uvicorn python-multipart numpy pillow python-dotenv google-generativeai langchain-core langchain-google-genai pymongo celery redis aiohttp supervision matplotlib requests dataclasses-json
```

Install inference-sdk separately (version-pinned):

```sh
pip install inference-sdk --no-deps
pip install 'opencv-python<=4.10.0.84,>=4.8.1.78'
```

> **Why pin opencv-python?** `supervision` pulls the latest opencv-python but `inference-sdk` requires ≤ 4.10.0.84. Installing inference-sdk first with `--no-deps` and then pinning opencv-python avoids the version conflict.

### 3. Environment Variables

Copy the example env file and fill in your API keys:

```sh
cp .env.example .env
```

Edit `.env` and set your keys:

| Variable | Service | Required For |
|---|---|---|
| `GOOGLE_API_KEY` | Google Generative AI | LLM OCR processing |
| `LANGCHAIN_API_KEY` | LangChain / LangSmith | Tracing (optional) |
| `ROBOFLOW_API_KEY` | Roboflow | Object detection / segmentation |
| `MONGO_URL` | MongoDB | Order log storage |

> The server will start without these keys, but AI features (OCR, segmentation) will fail at runtime. Health-check and order-list endpoints will still work.

### 4. Frontend Dependencies

```sh
cd frontend
pnpm install
```

## Usage

### Start Redis (for Celery tasks)

If you need background OCR processing, start Redis first:

```sh
redis-server
```

If you don't need OCR processing, you can skip this — the FastAPI server will still run.

### Running the Backend

```sh
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at **http://localhost:8000**.

- `/health/` — Health check (always available)
- `/orders/` — Fetch order logs (requires MongoDB)
- `/process-ocr/` — OCR processing (requires API keys + Redis + Celery)

### Running Celery Worker (for background tasks)

```sh
celery -A vision.config.celery_worker.celery_app worker --loglevel=info
```

### Running the Frontend

```sh
cd frontend
pnpm run dev
```

The frontend starts at **http://localhost:5173**.

## Troubleshooting

### `ModuleNotFoundError: No module named 'fastapi'`

Make sure you've activated the conda environment and installed all pip packages:

```sh
conda activate qualiscan
pip install fastapi uvicorn python-multipart numpy pillow python-dotenv google-generativeai langchain-core langchain-google-genai pymongo celery redis aiohttp supervision matplotlib requests dataclasses-json
```

### `Form data requires "python-multipart" to be installed`

```sh
pip install python-multipart
```

### `inference-sdk` version conflict with `opencv-python`

```sh
pip install 'opencv-python<=4.10.0.84,>=4.8.1.78'
```

### `GOOGLE_API_KEY` / `LANGCHAIN_API_KEY` warnings at startup

The server logs warnings if API keys are missing. The server will still run — you can use `/health/` and `/orders/` endpoints. Set your actual keys in `.env` to enable AI features.

### MongoDB connection error

If `MONGO_URL` is not set or MongoDB is unreachable, the server logs a warning. Order-log features will be unavailable, but the server will still run.

### Redis connection error for Celery

Make sure Redis is installed and running before starting the Celery worker:

```sh
# Install Redis (Ubuntu/Debian)
sudo apt install redis-server

# Start Redis
redis-server
```

## Key Files and Directories

- `frontend/src/pages/` — React page components (Dashboard, Test)
- `frontend/src/components/` — Shared React components (Header, ImageCard)
- `vision/routes.py` — FastAPI route definitions
- `vision/utils/image_processing.py` — Image segmentation & bounding boxes
- `vision/utils/llm_invoke.py` — LLM (Gemini) invocation via LangChain
- `vision/config/` — Configuration (API keys, Celery, MongoDB, Roboflow, logging)
- `vision/tasks/process_ocr_task.py` — Celery OCR task pipeline
- `vision/scripts/ocr/` — Standalone OCR notebooks (Colab, not imported by server)

## Contributing

1. Fork the repository.
2. Create a new branch:
    ```sh
    git checkout -b feature-branch
    ```
3. Commit your changes:
    ```sh
    git commit -m 'Add new feature'
    ```
4. Push to the branch:
    ```sh
    git push origin feature-branch
    ```
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

## Prompt for Vision Transformer Model

### Task Overview

Detect and recognize FMCG products in images, with a secondary feature to detect the ripeness and freshness of bananas, apples, and oranges. Classify each fruit as "Fresh," "Ripe," "Overripe," or "Spoiled".

### Input

An image containing one or more FMCG products, which may include bananas, apples, or oranges.

### Instructions

#### General Approach

1. **Segmentation & Identification**: Identify and segment each product.
2. **Product Recognition**: Recognize and classify FMCG products.
3. **Color Analysis**: For fruits, assess overall color for freshness and ripeness.
4. **Texture Evaluation**: For fruits, analyze surface texture for blemishes or softness.
5. **Shape Detection**: For fruits, detect contour and shape for irregularities.
6. **Output Format**: Classify each product and provide a confidence score.

#### Detailed Analysis for Each Fruit

- **Bananas**:
  - Fresh: Bright yellow, minimal brown spots.
  - Ripe: Yellow with some brown spots.
  - Overripe: Predominantly brown, mushy.
  - Spoiled: Black, moldy.
- **Apples**:
  - Fresh: Vibrant color, no spots.
  - Ripe: Mostly vibrant, few blemishes.
  - Overripe: Discoloration, large patches.
  - Spoiled: Shriveling, mold.
- **Oranges**:
  - Fresh: Bright orange, uniform color.
  - Ripe: Slightly duller, minimal blemishes.
  - Overripe: Brownish spots, uneven color.
  - Spoiled: Dark patches, mold.

### Output Format

```json
[
  { "Product": "Banana", "Classification": "Fresh", "Confidence_Score": 0.95 },
  { "Product": "Apple", "Classification": "Overripe", "Confidence_Score": 0.85 },
  { "Product": "Orange", "Classification": "Ripe", "Confidence_Score": 0.92 }
]
```

### Advanced Instructions

- Focus on high-quality segmentation.
- Leverage multi-scale analysis.
- Adapt confidence thresholds dynamically.
