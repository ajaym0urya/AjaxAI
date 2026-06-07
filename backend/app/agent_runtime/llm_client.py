import os
import json
from openai import AsyncAzureOpenAI
from dotenv import load_dotenv

load_dotenv()

# We will use dummy responses if the user hasn't configured the keys yet
_is_configured = bool(os.getenv("AZURE_OPENAI_API_KEY") and os.getenv("AZURE_OPENAI_ENDPOINT"))

if _is_configured:
    client = AsyncAzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "")
    )
    deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
else:
    client = None
    deployment_name = None

async def generate_json(system_prompt: str, user_prompt: str, fallback_mock: dict) -> dict:
    """
    Calls Azure OpenAI to generate a JSON response. 
    If keys are not configured, returns the fallback_mock.
    """
    if not _is_configured:
        print("[LLM Client] Keys missing. Falling back to mock data.")
        return fallback_mock

    try:
        response = await client.chat.completions.create(
            model=deployment_name,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[LLM Client] Error calling Azure OpenAI: {e}")
        return fallback_mock
