import os
import time
from typing import Any, Dict, List

from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

load_dotenv()
api_key = os.environ.get('API_KEY')
base_url = os.environ.get('BASE_URL')

# Endpoint for the external chat/vision agent API. If needed this can be
# overridden via env; otherwise we default to using base_url + /qa/chat
REKA_VIDEO_QA_ENDPOINT = os.environ.get(
    'REKA_VIDEO_QA_ENDPOINT', 
    f"{base_url.rstrip('/')}/qa/chat"
)

# Simple in-memory cache for videos to avoid hitting the API on every request.
_VIDEO_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "ttl": 60.0,
    "results": []
}


def fetch_videos() -> List[Dict[str, Any]]:
    """
    STEP: Listing videos dynamically — fetch_videos()
    Paste the full fetch_videos() implementation from the README here.

    Until you paste it, we return an empty list so the page renders.
    """
    return []


def call_reka_vision_qa(video_id: str) -> Dict[str, Any]:
    """
    STEP: Roast — Vision QA call (backend)
    Paste the full call_reka_vision_qa() implementation from the README here.
    """
    return {"error": "Not implemented. Paste call_reka_vision_qa() from README."}


def simple_markdown_to_html(md: str) -> str:
    """
    STEP: Roast — markdown to HTML
    Paste the full simple_markdown_to_html() implementation from the README here.
    """
    return ""


@app.route('/')
def home() -> str:
    """
    Render the home page with welcome text.

    Returns:
        str: Rendered HTML template for the home page.
    """
    return render_template('index.html')


@app.route('/form')
def form_page() -> str:
    """
    Render the form page with dynamic video selection grid.

    Returns:
        str: Rendered HTML template for the form page.
    """
    videos = fetch_videos()

    # Transform videos to a simplified structure for the template.
    template_videos = []
    for v in videos:
        meta = v.get("metadata", {})
        template_videos.append({
            "id": v.get("video_id"),
            "name": meta.get("title") or meta.get("video_name") or "Untitled",
            # fallback
            "thumbnail": meta.get("thumbnail") or "/static/images/image1.jpg",
            "url": v.get("url") or meta.get("url") or "",
        })

    return render_template('form.html', videos=template_videos)


@app.route('/api/upload_video', methods=['POST'])
def upload_video() -> Dict[str, Any]:
    """
    STEP: Add your own videos (Upload API route)
    Paste the full /api/upload_video route implementation from the README here.
    """
    return jsonify({"success": False, "error": "Not implemented. Paste /api/upload_video from README."}), 501


@app.route('/api/process', methods=['POST'])
def process_video() -> Dict[str, Any]:
    """
    STEP: Roast API route (/api/process)
    Paste the full /api/process route implementation from the README here.
    """
    return jsonify({"success": False, "error": "Not implemented. Paste /api/process from README."}), 501



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
