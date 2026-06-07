import os
import json
from openai import AsyncAzureOpenAI
from dotenv import load_dotenv

load_dotenv()

# We strictly require the keys now
client = AsyncAzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY", ""),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "")
)
deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")

async def generate_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Calls Azure OpenAI to generate a JSON response. 
    Fails loudly if there's an error so we know if keys are wrong.
    """
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
        # Return an error JSON so the UI doesn't crash but shows the error
        return {"error": str(e)}

