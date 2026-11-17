import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from graph import generate_linkedin_post


# =========================================
# INITIALIZE FASTAPI
# =========================================

app = FastAPI(
    title="LinkedIn Post Generator API",
    description="AI-powered LinkedIn content generation using LangGraph",
    version="1.0.0"
)


# =========================================
# CORS CONFIGURATION
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://linkedin-post-generator-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# REQUEST MODEL
# =========================================

class TopicRequest(BaseModel):
    topic: str


# =========================================
# HOME ROUTE
# =========================================

@app.get("/")
def home():
    return {
        "message": "LinkedIn Post Generator API is running!"
    }


# =========================================
# GENERATE LINKEDIN POST
# =========================================

@app.post("/generate")
async def generate_post(request: TopicRequest):
    if not request.topic.strip():
        raise HTTPException(
            status_code=400,
            detail="Topic cannot be empty."
        )

    try:
        result = await run_in_threadpool(
            generate_linkedin_post,
            request.topic.strip()
        )
        return result

    except Exception as e:
        # Prints full Python traceback in your terminal to debug 500 errors easily
        print("--- BACKEND EXCEPTION TRACEBACK ---")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )