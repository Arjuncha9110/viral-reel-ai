from openai import OpenAI

client = OpenAI(api_key="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")

prompt = """
Create a short viral Instagram reel script about luxury Bali travel.
Strong hook.
20 seconds.
"""

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "user", "content": prompt}
    ]
)

print(response.choices[0].message.content)