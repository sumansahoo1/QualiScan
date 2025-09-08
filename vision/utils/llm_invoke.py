from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from vision.constants import MODEL_NAMES

class LLMInvoker:
    def __init__(self, model_name: str):
        self.llm = ChatGoogleGenerativeAI(model=model_name)

    def invoke(self, prompt: str, image_content_type: str, segmented_image_base64: str):
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/{image_content_type.split('/')[-1]};base64,{segmented_image_base64}"
                    },
                },
            ]
        )
        ai_msg = self.llm.invoke([message])
        return ai_msg

    def invoke_text_only(self, prompt: str):
        """
        Invoke the LLM with text-only prompt, no image.

        Args:
            prompt (str): The text prompt to send to the LLM

        Returns:
            The AI message response
        """
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt}
            ]
        )
        ai_msg = self.llm.invoke([message])
        return ai_msg
