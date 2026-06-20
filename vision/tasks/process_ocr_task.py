from ..config.celery_worker import celery_app
import os
from ..utils.image_processing import segment_image, encode_image_to_base64, draw_bounding_boxes
from ..utils.llm_invoke import LLMInvoker
from ..utils.sanitize import strip_json_markers, parse_json_content
from ..utils.prompt.load_prompt import load_input_prompt
from ..constants import MODEL_NAMES
from ..utils.db_operations import store_order_log_in_db, get_next_order_id
from ..config.roboflow import get_roboflow_client
from ..config.logging_config import configure_logging

@celery_app.task(name="vision.tasks.process_ocr_task")
def process_ocr_task(temp_image_path, image_content_type, expected_values):
    """Process OCR task.

    Note: Celery doesn't support async tasks directly, so we've converted this to a synchronous function.
    """
    roboflow_client = get_roboflow_client()
    logger = configure_logging()

    # Generate orderid
    order_id = get_next_order_id()
    logger.info(f"Generated orderid: {order_id}")

    # Process and encode image
    with open(temp_image_path, "rb") as f:
        image_file = f.read()
    segmented_image_path, predictions = segment_image(image_file, roboflow_client)
    output_image_path = draw_bounding_boxes(segmented_image_path, predictions["predictions"])
    encoded_image_base64 = encode_image_to_base64(output_image_path)
    logger.info("Image encoding completed")

    # Call LLM
    input_prompt = load_input_prompt()
    llm_invoker = LLMInvoker(MODEL_NAMES["GEMINI_FLASH"])
    ai_msg = llm_invoker.invoke(input_prompt, image_content_type, encoded_image_base64)
    actual_values = parse_json_content(ai_msg.content)
    logger.info("AI message received from LLM")

    # Clean up
    os.remove(output_image_path)
    os.remove(segmented_image_path)
    os.remove(temp_image_path)

    # Store results in DB
    store_order_log_in_db(order_id, expected_values, actual_values)
