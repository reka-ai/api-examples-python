# Roast My Life: AI Commentary on Your Camera Roll

Roast My Life is a playful Python + Flask demo showcasing how to use the **Reka Vision API** to (nicely) roast the people in your videos – like an AI best friend commenting on your questionable life choices. 😅

This project started as a generic Python web demo and has been adapted into a Vision + LLM sample you can learn from, hack on, and extend. Drop in your own videos (or connect to an existing Guardian-style endpoint) and let the model deliver light‑hearted commentary.

## Features

- 🔍 Dynamic video list fetched from a Reka Vision backend 
- 🤖 Reka Vision chat endpoint integration for roasting 
- 🧪 Clean, documented Python code (type hints + docstrings)
- 🐳 Docker support for fast containerized runs
- 📱 Responsive UI with a lightweight custom palette

## Project Structure

```
.
├── src/                  # Application source code
│   ├── app.py           # Main Flask application
│   ├── templates/       # HTML templates
│   │   ├── index.html  # Home page
│   │   └── form.html   # Video selection form page
│   └── static/         # Static files
│       ├── css/
│       │   └── style.css    # Stylesheets
│       └── images/     # Image assets
├── requirements.txt     # Python dependencies
└── Dockerfile          # Docker configuration
```

## Prerequisites

- Python 3.12 or higher
- pip (Python package manager)

or

- Docker/ Podman

## Installation & Setup

### Option 1: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/reka-ai/api-examples-python.git
   cd roast_my_life
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python src/app.py
   ```

5. **Open your browser**
   Navigate to: `http://localhost:5000`

### Option 2: Run with Docker

1. **Build the Docker image**
   ```bash
   docker build -t roast-my-life .
   ```

2. **Create a .env file (or reuse the provided `.env-sample`)**
   Place it in this folder (`roast_my_life/.env`). Example:
   ```env
   API_KEY=your_actual_api_key_here
   BASE_URL=https://vision-agent.api.reka.ai
   ```

3. **Run the container passing your env file (recommended)**
   ```bash
   docker run --env-file .env -p 5000:5000 roast-my-life
   ```

   Alternatively, you can pass variables individually:
   ```bash
   docker run -e API_KEY=xxxx -e BASE_URL=https://vision-agent.api.reka.ai -p 5000:5000 roast-my-life
   ```

   For CI-only scenarios, you may inject values during build (not for secrets):
   ```bash
   docker build --build-arg API_KEY=placeholder --build-arg BASE_URL=https://vision-agent.api.reka.ai -t roast-my-life .
   ```
   Note: build args become part of the image metadata layers; avoid using them for real secrets.

3. **Open your browser**
   Navigate to: `http://localhost:5000`

## Environment Variables

Create a `.env` file, using the sample `.env-sample` (or export env vars) with at least:

```
# Primary API key (used both for video listing and, if api_key unset, for chat)
API_KEY=your_api_key_here

# Endpoint serving your video catalog (must support POST /videos/get)
BASE_URL=https://vision-agent.api.reka.ai
```

Runtime precedence: values passed via `docker run -e/--env-file` override any build-time defaults. The app also loads `.env` when run locally via `python src/app.py` thanks to `python-dotenv`.

## Usage

1. Open the app and navigate to the Roast page.
3. Click a video to select it (highlighted state).
4. Press "Roast Video" – the app sends a chat request with a gentle roast prompt.
5. Enjoy your gentle roasting.

If no videos appear, verify `BASE_URL` + `API_KEY`. If the roast fails, you'll see an error fallback (HTTP status message or parsed error body).


## Contributing

This is a playful learning sample. PRs that improve safety, resilience, or developer ergonomics are welcome. Keep the roast friendly. 😇

## Ethics & Disclaimer

The roasting is intended to be light and positive. Always review model outputs before sharing. Do not deploy without additional safeguards for abusive or unsafe content.

## License

Educational / sample use. Adapt freely.

---

Reka Vision API docs: https://docs.reka.ai/vision  |  Get a FREE API Key: https://link.reka.ai/free

Part of Reka's code samples made so you can learn while having fun.