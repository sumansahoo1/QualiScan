import os

def load_input_prompt():
    """
    Loads the input prompt from the input_prompt.txt file located in the same directory as this script.
    Returns:
        str: The contents of the input prompt file.
    """
    prompt_path = os.path.join(os.path.dirname(__file__), "input_prompt.txt")
    with open(prompt_path, "r") as file:
        prompt = file.read().strip()
    return prompt

def load_comparison_prompt():
    """
    Loads the comparison prompt from the comparison_prompt.txt file located in the same directory as this script.
    Returns:
        str: The contents of the comparison prompt file.
    """
    prompt_path = os.path.join(os.path.dirname(__file__), "comparison_prompt.txt")
    with open(prompt_path, "r") as file:
        prompt = file.read().strip()
    return prompt
