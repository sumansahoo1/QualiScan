from ..config.mongo import db

def get_next_order_id() -> int:
    """Get the next order ID by counting existing documents"""
    return db["logs"].count_documents({}) + 1

def store_order_log_in_db(order_id: int, expected_values: list, actual_values: dict, review_result: dict = None) -> None:
    """Insert a new log record into the database

    Args:
        order_id: Unique identifier for the order
        expected_values: Expected values provided by the user
        actual_values: Actual values extracted by OCR
        review_result: Comparison results and review status from AI comparison
    """
    log_entry = {
        "order_id": order_id,
        "expected_values": expected_values,
        "actual_values": actual_values
    }

    if review_result:
        log_entry["review"] = review_result

    db["logs"].insert_one(log_entry)
