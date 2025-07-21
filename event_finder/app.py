"""
Event Finder Demo App

This Streamlit app demonstrates how to use the Reka Research to perform agentic web search
and generate structured outputs using the `response_format` parameter.

Key features showcased:
- `response_format`: Ensures consistent and structured output in JSON Schema format, making it easy to render UI elements.
- `web_search` config: Allows fine-grained control of search scope by specifying allowed or blocked domains.

Developers can use this as a template to build domain-specific search experiences that return structured data
for rendering event listings or other content.
"""
import json
import os

import streamlit as st
from openai import OpenAI

# Page configuration
st.set_page_config(page_title="Event Finder", page_icon="📅", layout="centered")

# Custom CSS for better styling
st.markdown(
    """
<style>
    .event-card {
        background: #F1EEE7;
        padding: 20px;
        margin: 15px 0;
    }
    
    .event-title {
        color: #2E2F2F;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px; 
    } 
    
    .event-date {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 10px;
    }
    
    .event-url {
        color: #2276FF;
        text-decoration: none;
        font-weight: 500;
    }
</style>
""",
    unsafe_allow_html=True,
)

# Title and header
st.markdown(
    '<div class="search-header"><h1 style="padding:0">Event Finder</h1><p>Discover events using Reka Research</p></div>',
    unsafe_allow_html=True,
)

# API Key input
api_key = os.getenv("REKA_API_KEY")

client = OpenAI(
    base_url="https://api.reka.ai/v1",
    api_key=api_key,
)

# Event search input
user_prompt = st.text_area(
    "What events are you looking for?",
    placeholder="Find tech conferences in San Francisco this month...\nUpcoming music festivals in Europe...\nLocal food events this weekend...",
    height=100,
)

# Search scope configuration
search_scope = st.radio(
    "Choose search scope:",
    ["No restrictions", "Allowed domains only", "Block specific domains"],
)

domains_input = ""
if search_scope == "Allowed domains only":
    domains_input = st.text_area(
        "Allowed Domains (one per line)",
        placeholder="eventbrite.com\nmeetup.com\nfacebook.com",
    )
elif search_scope == "Block specific domains":
    domains_input = st.text_area(
        "Blocked Domains (one per line)",
        placeholder="spam-events.com\nlow-quality-site.com",
    )


# Function to make API call
def search_events(prompt: str, search_config: dict):
    # Define the expected structured output format using JSON Schema.
    # This ensures that the model returns a well-structured list of events with title, date, and URL.
    # For more information on JSON Schema, see https://docs.reka.ai/research/structured-output
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "event_list",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "events": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "date": {"type": "string" },
                                "url": {"type": "string"},
                            },
                            "required": ["title", "date", "url"],
                            "additionalProperties": False,
                        },
                    }
                },
                "required": ["events"],
                "additionalProperties": False,
            },
        },
    }

    # Uncomment the following lines to use Pydantic for defining the schema.
    # This is an alternative to using JSON Schema directly.
    # from pydantic import BaseModel

    # class Event(BaseModel):
    #     title: str
    #     date: str
    #     url: str  

    # response_format = {
    #     "type": "json_schema",
    #     "json_schema": {
    #         "schema": Event.model_json_schema(),
    #         "name": "Event",
    #         "strict": True,
    #     },
    # }
    
    try:
        stream = client.chat.completions.create(
            model="reka-flash-research",
            messages=[{"role": "user", "content": prompt}],
            response_format=response_format,
            # Enable agentic web search with the Reka API.
            # The search_config object lets you customize which domains to include or exclude from the search.
            extra_body={"research": {"web_search": search_config}},
            stream=True,
        )
        return stream
    except Exception as e:
        st.error(f"API request failed: {str(e)}")
        return None


# Function to display events
def display_events(events_data):
    if not events_data or "events" not in events_data:
        st.warning("No events found matching your criteria.")
        return

    events = events_data["events"]

    if not events:
        st.warning("No events found matching your criteria.")
        st.markdown(events_data)
        return

    st.success(f"Found {len(events)} events!")

    # Display events in a visually appealing format
    for event in events:
        st.markdown(
            f"""
        <div class="event-card">
            <div class="event-title">{event.get('title', 'Untitled Event')}</div>
            <div class="event-date">{event.get('date', 'Date TBD')}</div>
            <a href="{event.get('url', '#')}" target="_blank" class="event-url">{event.get('url', 'No url found.')}</a>
        </div>
        """,
            unsafe_allow_html=True,
        )


# Search button and results
if st.button("Find Events", type="primary", use_container_width=True):
    if not user_prompt.strip():
        st.error("Please enter a search query for events.")
    else:
        # Prepare search configuration
        search_config = {"enabled": True}

        if search_scope == "Allowed domains only" and domains_input.strip():
            domains = [
                domain.strip()
                for domain in domains_input.strip().split("\n")
                if domain.strip()
            ]
            search_config["allowed_domains"] = domains
        elif search_scope == "Block specific domains" and domains_input.strip():
            domains = [
                domain.strip()
                for domain in domains_input.strip().split("\n")
                if domain.strip()
            ]
            search_config["blocked_domains"] = domains

        stream = search_events(user_prompt, search_config)

        if stream:
            # with st.spinner("Finding events...", show_time=True):
            reasoning_box = st.expander("Reasoning steps", expanded=True)
            reasoning_placeholder = reasoning_box.empty()
            stream_buffer = ""
            try:
                for chunk in stream:
                    delta = chunk.choices[0].delta
                    if not delta:
                        continue

                    if delta.reasoning_steps:
                        for step in delta.reasoning_steps:
                            if step.get("reasoning_content"):
                                stream_buffer += "\n\n" + step["reasoning_content"]
                                reasoning_placeholder.markdown(stream_buffer)
                            if step.get("content"):
                                stream_buffer += "\n\nExecuted " + step["content"].get("tool_name")
                                reasoning_placeholder.markdown(stream_buffer)

                    if delta.content:
                        try:
                            events_data = json.loads(delta.content)
                            display_events(events_data)
                        except json.JSONDecodeError:
                            st.error("Received malformed JSON response. Please try again.")
            except Exception as e:
                st.error(f"An error occurred while processing the response: {str(e)}")
