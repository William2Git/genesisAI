# Friends2Go 🍔🍕🍣

**Friends2Go** is an AI-powered platform built to **"get the plans out of the group chat."** It takes arbitrary prompts, ideas, and debates from friend groups and instantly generates concrete, actionable plans.

The **Food Finder** component—currently implemented in this repository—is the first piece of this grand vision. It combines a React frontend, a Node.js API layer, and a Python microservice to parse natural language food cravings (e.g., "cheap tacos near downtown for 3 people") and fetch real-time, highly curated restaurant data via the Yelp Fusion API and Google Maps Places API.

## 🚀 Features

- **Natural Language Search:** Tell the AI exactly what you're craving (e.g., "cheap tacos near downtown for 3 people") and it intelligently extracts the core preferences.
- **AI-Powered Comparisons:** Compare different nearby restaurant options side-by-side with an expert AI food critic that analyzes differences in ambiance, price, rating, and overall vibe.
- **Voice Capabilities:** Built-in microphone support for dictating exactly what you want to eat in multiple languages.
- **Interactive Mapping:** Powered by Google Maps, visualize nearby recommendations, get directions, and see estimated walking times to deals around you.
- **Smart Filtering:** Built-in backend filters guarantee you only get restaurants, deliberately stripping out hotels, hostels, and resorts from the recommendations.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Vanilla CSS
- **Backend (Node.js API):** Express, Proxying to LLM APIs
- **Backend (Python NLP API):** Flask, python-dotenv
- **APIs Integrated:**
  - OpenAI (for parsing user requests and generating restaurant comparisons)
  - Yelp Fusion API (for searching restaurants in the Python backend and Node proxy)
  - Google Maps JavaScript API (for MapView, Places, and Directions)

## 📦 Prerequisites

Before running the application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python 3.10+](https://www.python.org/)
- API Keys for **OpenAI**, **Yelp**, and **Google Maps**.

## ⚙️ Installation & Setup

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd "GenAI - Food project"
   ```

2. **Frontend Setup (React):**
   Install frontend dependencies:
   ```bash
   npm install
   ```
   Start the frontend React development server (runs on `localhost:5173` typically):
   ```bash
   npm run dev
   ```

3. **Node.js Server Setup:**
   Navigate to the `server/` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
   Start the Node server (runs on `localhost:4000`):
   ```bash
   node index.js
   ```

4. **Python Backend Setup:**
   It is recommended to use a virtual environment (`venv`).
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   ```
   Install the necessary Python packages:
   ```bash
   pip install flask flask-cors openai python-dotenv requests
   ```
   Start the Python Flask application (runs on `localhost:5000`):
   ```bash
   python main.py
   ```

## 🔐 Environment Variables

You need to create a `.env` file at the root of the project with the following variables:

```ini
# .env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_MAP_ID=your_google_map_id_here
VITE_RECOMMENDATIONS_API_URL=http://localhost:4000/api/recommendations

OPENAI_API_KEY=your_openai_api_key_here
YELP_API_KEY=your_yelp_fusion_api_key_here
```

## 🖥️ Usage

1. **Start all three servers** as outlined in the setup instructions (Frontend, Node, and Python).
2. Ensure you have granted **Location Permissions** in your browser so the Google Maps component can fetch real-time restaurants near you.
3. Use the search bar or the microphone to describe what you want to eat.
4. Click "Show Route" on a listing to see map directions, or click "Compare" on the route view to get an AI-generated personalized comparison of your curated dining options!
