"""
Streaming Demo using Reka API and Gradio

This app demonstrates how to use the Reka API to stream reasoning steps
for a research assistant prompt. It uses Gradio's ChatInterface and 
displays each reasoning step in real-time.

To run:
    $ python streaming_app.py

Environment:
    - Set REKA_API_KEY in your environment variables with your Reka API key.
"""

import json
import os
import time

from openai import OpenAI

import gradio as gr
from gradio import ChatMessage

# -------- Reka / OpenAI client setup --------
API_KEY = os.getenv("REKA_API_KEY", "your_api_key_here")
client = OpenAI(
    base_url="https://api.reka.ai/v1",
    api_key=API_KEY,
)

MODEL = "reka-flash-research"


# -------- Chat handler --------
def reka_stream(message: str, _):
    """
    Stream assistant reasoning + final answer in two phases:
    1. A 'Thinking' message that is updated in‑place with bullet‑point reasoning steps
    2. The assistant's final answer once streaming is complete
    """
    start_time = time.time()

    # --- initialise 'thinking' placeholder ---
    thinking_msg = ChatMessage(
        content="",
        metadata={"title": "_Thinking_ step‑by‑step", "id": 0, "status": "pending"},
    )
    yield thinking_msg

    # --- call Reka API ---
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": message}],
        stream=True,
    )

    accumulated_reasoning = ""
    final_answer = ""

    for chunk in stream:
        delta = chunk.choices[0].delta

        # accumulate reasoning lines (either from reasoning_steps or reasoning_content)
        if delta.reasoning_steps:
            step = delta.reasoning_steps[-1]
            if step.get("reasoning_content"):
                accumulated_reasoning += f"- {step['reasoning_content'].strip()}\n\n"
                thinking_msg.content = accumulated_reasoning.strip()
                yield thinking_msg
            if step.get("tool_calls"):
                for tool_call in step["tool_calls"]:
                    print(tool_call)
                    if tool_call.get("name") == "search_web":
                        accumulated_reasoning += f"- Searching the web for: \"{tool_call.get('args', {}).get('query', '')}\"\n\n"
                    elif tool_call.get("name") == "analyze":
                        accumulated_reasoning += f"- Analyzing webpages: \"{tool_call.get('args', {}).get('urls', '')}\"\n\n"
                thinking_msg.content = accumulated_reasoning.strip()
                yield thinking_msg

        elif delta.reasoning_content:
            accumulated_reasoning += f"- {delta.reasoning_content.strip()}\n\n"
            thinking_msg.content = accumulated_reasoning.strip()
            yield thinking_msg

        # accumulate final natural‑language answer
        if delta.content:
            final_answer += delta.content

    # mark thinking complete
    thinking_msg.metadata["status"] = "done"
    thinking_msg.metadata["duration"] = time.time() - start_time
    yield thinking_msg

    # deliver final answer
    yield [
        thinking_msg,
        ChatMessage(content=final_answer.strip() or "(no content returned)"),
    ]


# -------- Launch Gradio UI --------
chat = gr.ChatInterface(
    fn=reka_stream,
    title="Reka Research – Streaming Demo",
    type="messages",
    show_progress=True,
)

if __name__ == "__main__":
    chat.launch()
