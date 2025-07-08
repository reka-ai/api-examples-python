# Reka Research – Streaming Demo (Gradio)

This demo shows how to use the Reka API to build a research assistant that streams reasoning steps in real-time using Gradio.

## Features

- Streams intermediate reasoning steps (`reasoning_steps`) from the Reka API
- Displays each step as it arrives so developers can inspect the model’s chain‑of‑thought
- Minimal, self‑contained example (single Python file)

## Setup

1. Install the required packages:

   ```bash
   pip install gradio openai
   ```

2. Set your Reka API key as an environment variable:

   ```bash
   export REKA_API_KEY=your_api_key_here
   ```

3. Launch the demo:

   ```bash
   python streaming_app.py
   ```

   Gradio will print a local URL (e.g. <http://127.0.0.1:7860>) – open that in a browser.

## File Overview

- `streaming_app.py`: Gradio UI that calls the Reka API with streaming enabled
- `README.md`: Setup and usage instructions

For more details about the API, see the docs at <https://docs.reka.ai>.
