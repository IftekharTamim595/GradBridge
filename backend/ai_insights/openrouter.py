import requests
import json
from django.conf import settings
import os

def call_openrouter(prompt, system_prompt="You are a helpful career assistant for college students."):
    """
    Generic helper to call OpenRouter.
    """
    api_key = settings.OPENROUTER_API_KEY if hasattr(settings, 'OPENROUTER_API_KEY') else os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        return "AI Error: Missing API Key"

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            })
        )
        
        result = response.json()
        if 'choices' in result:
             return result['choices'][0]['message']['content']
        return f"AI Error: {result}"
    except Exception as e:
        return f"AI Error: {str(e)}"
