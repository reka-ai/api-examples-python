
# Reka API Examples

![Reka AI](assets/reka-ai-cover.jpeg)

This repository showcases how to use the **Reka Research** to build intelligent apps that can search the web, structure responses, and support reasoning. It’s designed to help developers learn how to integrate and use Reka Research with different tools and frameworks.

## 📚 What's in this repo

| Folder/File                                | Description                                                                |
|--------------------------------------------|----------------------------------------------------------------------------|
| `Use Reka Research with OpenAI SDK.ipynb`  | Example notebook using the OpenAI SDK to call the Reka API                 |
| `Use Reka Research with requests.ipynb`    | Example notebook using raw HTTP requests to call the Reka API              |
| `gradio/`                                  | Gradio app that streams responses and displays reasoning steps             |
| `streamlit/`                               | Streamlit app that streams responses and displays reasoning steps          |
| `event_finder/`                            | Streamlit app for researching and finding events with Reka Research        |
| `typescript/`                              | Typescript app for researching and finding restaurants with Reka Research  |

## 🚀 Getting Started (Python)

1. **Install requirements**  

   ```bash
   pip install openai streamlit gradio requests
   ```

2. **Get your Reka API Key**  

   Sign up at [Reka Platform](https://platform.reka.ai) and get your API key.

3. **Set environment variable**

   ```bash
   export REKA_API_KEY=your_api_key_here
   ```

4. **Run an app**
   - Event Finder: `cd event_finder && streamlit run app.py`
   - Gradio: `cd gradio && python app.py`
   - Streamlit: `cd streamlit && streamlit run app.py`
   - Jupyter notebooks: Open and run in your preferred environment

##  🖥️ Getting Started (Typescript)

1. **Install requirements**  

   Make sure you have Node.js (version 18 or higher) and npm installed on your system.
   
   ```bash
   cd typescript/reka-restaurants
   npm install
   ```

2. **Get your Reka API Key**  

   Sign up at [Reka Platform](https://platform.reka.ai) and get your API key.

3. **Set environment variable**

   ```bash
   export REKA_API_KEY=your_api_key_here
   ```

4. **Run the app**
   
   ```bash
   npm run build
   npm start
   ```
   Open your browser and navigate to http://localhost:5173

## 🧪 Why use this repo?

- Learn how to use Reka Research with requests and OpenAI SDK
- Build agents that can think step-by-step and cite sources
- Learn to control structured outputs using `response_format`
- Control domain scope and search behavior using `web_search` config

## 🛠 Recommended Use Cases

- Web search with control over allowed domains
- Research agents with explainable reasoning steps

## 🤝 Contributions

Feel free to open issues or submit PRs to add more examples or improve existing ones.
