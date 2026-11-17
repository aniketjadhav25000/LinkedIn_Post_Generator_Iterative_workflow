# PostCraft – AI-Powered LinkedIn Post Generator

An AI-powered LinkedIn content generator built using **LangGraph, FastAPI, and React**. It uses an iterative multi-agent workflow to generate, review, and refine LinkedIn posts until they meet the required quality standards.

**Live Demo:** https://linkedin-post-generator-frontend.onrender.com

**GitHub Repository:** https://github.com/aniketjadhav25000/LinkedIn_Post_Generator_Iterative_workflow

---

## Features

- **AI Content Generation:** Generate professional LinkedIn posts from a given topic.
- **Multi-Agent Workflow:** Separate Writer and Reviewer agents with different responsibilities.
- **Iterative Refinement:** Automatically improves drafts using reviewer feedback.
- **Web Search Integration:** Uses Tavily Search to retrieve relevant information when needed.
- **Conditional Routing:** Uses LangGraph conditional edges to control workflow execution.
- **Quality Evaluation:** Reviews content for readability, engagement, structure, and tone.
- **Maximum Attempts:** Allows up to three writing attempts.
- **Interactive UI:** React-based frontend for generating and viewing posts.
- **Docker Support:** Containerized frontend and backend.
- **Cloud Deployment:** Deployed on Render.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, Vite |
| Backend | Python, FastAPI |
| AI Workflow | LangGraph, LangChain |
| Writer Model | Google Gemini |
| Reviewer Model | Groq |
| Web Search | Tavily Search |
| Containerization | Docker, Docker Compose |
| Deployment | Render |

---

## System Architecture

The application follows a frontend-backend architecture with an iterative AI workflow powered by LangGraph.

    USER
      |
      v
    REACT FRONTEND
      |
      | HTTP Request
      v
    FASTAPI BACKEND
      |
      v
    LANGGRAPH WORKFLOW
      |
      v
    WRITER AGENT (Google Gemini)
      |
      v
    TAVILY SEARCH (Optional)
      |
      v
    DRAFT GENERATION
      |
      v
    REVIEWER AGENT (Groq)
      |
      v
    CONDITIONAL ROUTING
      |
      +-------------------+
      |                   |
    APPROVED            REJECTED
      |                   |
      v                   v
    FINISH            CHECK ATTEMPTS
                          |
                     +----+----+
                     |         |
                    < 3       >= 3
                     |         |
                     v         v
                WRITER AGENT  FINISH
                     |
                     v
                REVISED DRAFT

### Workflow Explanation

1. **User Input:** The user submits a topic through the React interface.
2. **Writer Agent:** Google Gemini generates a LinkedIn post.
3. **Web Search:** Tavily Search retrieves relevant information when required.
4. **Reviewer Agent:** Groq evaluates the generated post against predefined quality criteria.
5. **Conditional Routing:** LangGraph checks the review result.
6. **Refinement:** If rejected, reviewer feedback is passed back to the Writer Agent.
7. **Termination:** The workflow ends when the post is approved or three attempts are completed.

---

## Project Structure

    LinkedIn_Post_Generator_Iterative_workflow/
    |
    |-- backend/
    |   |-- main.py
    |   |-- graph.py
    |   |-- requirements.txt
    |   |-- Dockerfile
    |   |-- .dockerignore
    |   |-- .env
    |
    |-- frontend/
    |   |-- src/
    |   |   |-- App.jsx
    |   |   |-- ...
    |   |
    |   |-- public/
    |   |-- package.json
    |   |-- package-lock.json
    |   |-- Dockerfile
    |   |-- ...
    |
    |-- compose.yaml
    |-- .gitignore
    |-- README.md

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm
- Git
- Docker Desktop (optional)

### 1. Clone the Repository

    git clone https://github.com/aniketjadhav25000/LinkedIn_Post_Generator_Iterative_workflow.git

    cd LinkedIn_Post_Generator_Iterative_workflow

### 2. Backend Setup

    cd backend

    python -m venv venv

    venv\Scripts\activate

    pip install -r requirements.txt

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

    GOOGLE_API_KEY=your_google_api_key
    GROQ_API_KEY=your_groq_api_key
    TAVILY_API_KEY=your_tavily_api_key

Replace the placeholder values with your actual API keys. Never commit API credentials to GitHub.

### 4. Start the Backend

    uvicorn main:app --reload

Backend URL: http://localhost:8000

API Documentation: http://localhost:8000/docs

### 5. Frontend Setup

Open another terminal and navigate to the frontend directory:

    cd frontend

    npm install

Create a `.env` file inside the frontend directory:

    VITE_API_URL=http://localhost:8000

Make sure the frontend API request uses the configured URL:

    const apiUrl = `${import.meta.env.VITE_API_URL}/generate`;

### 6. Start the Frontend

    npm run dev

Frontend URL: http://localhost:5173

---


## Deployment

The application is deployed on **Render**.

| Component | Platform |
|---|---|
| Frontend | Render Static Site |
| Backend | Render Web Service |
| Source Code | GitHub |
| Containerization | Docker |

**Live Application:** https://linkedin-post-generator-frontend.onrender.com

**Note:** Render's free backend services may spin down after inactivity, resulting in a delay on the first request.

---

## Author

**Aniket Jadhav**

Aspiring AI Engineer | Full Stack Developer

- **GitHub:** https://github.com/aniketjadhav25000
- **LinkedIn:** https://www.linkedin.com/in/aniket-jadhav-a72466236/
- **Portfolio:** https://portfolio-ani-react.netlify.app/
