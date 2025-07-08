"""
Streaming Demo using Reka API and Streamlit

This app demonstrates how to use the Reka API to stream reasoning steps
for a research assistant prompt. It uses Streamlit's chat interface and
displays each reasoning step in real-time.

To run:
    $ streamlit run streaming_app.py

Environment:
    - Set REKA_API_KEY in your environment variables with your Reka API key.
"""

import json
import os

import streamlit as st
from openai import OpenAI

# -------- Streamlit page setup --------
st.set_page_config(page_title="Reka Research – Streaming Demo")
st.title("Reka Research – Streaming Demo")


# -------- Reka / OpenAI client setup --------
API_KEY = os.getenv("REKA_API_KEY", "your_api_key_here")
client = OpenAI(
    base_url="https://api.reka.ai/v1",
    api_key=API_KEY,
)

MODEL = "reka-flash-research"

prompt = st.chat_input("Ask a research question…")

if prompt:
    # Show the user’s message
    st.chat_message("user").markdown(prompt)

    # Prepare a container for the streamed assistant steps
    assistant_section = st.chat_message("assistant")
    with assistant_section:
        steps_box = st.container()  # each reasoning step will be printed here

    # Call Reka with streaming enabled
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    # Stream reasoning_steps one‑by‑one with a spinner
    with steps_box, st.spinner("Assistant is thinking…"):
        for chunk in stream:
            delta = chunk.choices[0].delta

            if delta.reasoning_steps:
                # Show every field separately and immediately
                step = delta.reasoning_steps[-1]

                # textual reasoning (reasoning_content)
                text_piece = step.get("reasoning_content")
                if text_piece:
                    steps_box.markdown(text_piece)

                # any tool calls
                if step.get("tool_calls"):
                    tool_json = json.dumps(step["tool_calls"], indent=2)
                    steps_box.markdown(f"```json\n{tool_json}\n```")

            else:
                if delta.reasoning_content:
                    steps_box.markdown(delta.reasoning_content)
                    steps_box.divider()
                if delta.content:
                    steps_box.markdown(delta.content)
