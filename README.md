# Introduction

## What is SmartMeal?

SmartMeal is a personalized meal planning web app that lets users log ingredients they have on hand, get curated recipe suggestions, and generate custom dishes using AI.

With SmartMeal, you can:

1. Log ingredients (with amounts and timestamps)

2. Browse curated recipes using TheMealDB API

3. Use OpenAI to generate similar dishes tailored to your preferences

For more details, view the full project proposal [here](https://docs.google.com/document/d/1oezemoVyaGVz60XJV3XaLUTNkOXfVEgYR8f2rf_2j-Y/edit?usp=sharing).

# Technical Architecture

**Frontend (Next.js)**
Handles UI, routing, and user interaction. Talks to the backend using Axios.

**Backend API (Node + Express)**
Central RESTful API that manages authentication, database interaction, and bridges to the AI microservice. Uses PostgreSQL for persistent storage and Passport.js for secure session handling.

**AI Microservice (Flask + OpenAI)**
Handles ingredient preprocessing (cleaning/spellcheck) and generates AI-powered meal plans. Receives POST requests from the backend or frontend.

**PostgreSQL Database**
Stores user accounts, food logs, and timestamps. Queried by the backend for all persistent data needs.

# Developers
**Sanjay** – Frontend (UI, recipe browsing, log-food page)

**Sushanth** – Frontend (styling, interactions, integration)

**Amogh** – Backend (routes, DB queries, session handling)

**Vishnu** – Backend (authentication, Flask bridge, database design)

# Installation & Setup

## Prerequisites
- Node.js
- PostgreSQL
- Python 3 (for Flask microservice)

## Install dependencies
### Frontend (Next.js):
```
cd frontend
npm install
```

### Backend (Express + Node):
```
cd backend
npm install
```

### AI Microservice (Flask, GPT):
```
cd ai-service
pip install flask flask_cors request jsonify
```

## Environment Variables
Create a `.env` file in your `/backend` folder:
```
PORT=5001
SESSION_SECRET=your_secret_key
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/mealplan
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

# Running the App
### Start the backend:
```
cd backend
npm start
```

### Start AI Microservice
```
cd ai-service
python app.py
```

### Start the frontend:
```
cd frontend
npm run dev
```
