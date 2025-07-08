# Reka Research - Streaming Demo (Streamlit)

This demo shows how to use the Reka API to build a research assistant that streams reasoning steps in real-time using Streamlit.

## Features

- Streams intermediate reasoning steps (`reasoning_steps`) from the Reka API
- Displays any final content with clickable links and visual separation
- Clean UI with assistant/user roles

## Setup

1. Install the required packages:

    ```bash
    pip install streamlit openai
    ```

2. Set your Reka API key as an environment variable:

    ```bash
    export REKA_API_KEY=your_api_key_here
    ```

3. Launch the demo:

    ```bash
    streamlit run streaming_app.py
    ```

## File Overview

- `streaming_app.py`: Streamlit UI that calls the Reka API with streaming enabled
- `README.md`: Setup and usage instructions

For more info, visit: [https://docs.reka.ai](https://docs.reka.ai)
