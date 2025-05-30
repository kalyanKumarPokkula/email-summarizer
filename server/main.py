from llm import email_summarizer, email_reply
from fastapi import FastAPI , HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel # Import BaseModel for request body validation

app = FastAPI()

origins = [
    "https://mail.google.com",  # Allow requests from Gmail
    "http://localhost:3000",    # Allow requests from local frontend (optional)
    "http://localhost:8000"     # Allow self-origin requests
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define request body models for type checking and validation
class SummarizeRequest(BaseModel):
    email: str
    privacy_mode: bool
    openai_api_key: str = None # Optional API key

class ReplyRequest(BaseModel):
    email_content: str # Changed from 'mail_content' to match client potentially
    privacy_mode: bool
    openai_api_key: str = None # Optional API key

@app.get("/")
def read_root():
    return {"messages" : "Welcome to the Email Summarizer Backend!"}

@app.post("/summarize")
def summarize(request_data: SummarizeRequest): # Use the Pydantic model
    try:
        # Pass the API key to the summarizer function
        cleaned_json_data = email_summarizer(
            request_data.email,
            request_data.privacy_mode,
            request_data.openai_api_key
        ).strip('```json\n').strip('```')
        
        parsed_data = json.loads(cleaned_json_data)
        return parsed_data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except json.JSONDecodeError:
        # Handle cases where the cleaned data is still not valid JSON
        raise HTTPException(status_code=500, detail="Failed to parse summary output as JSON.")
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during summarization.")

@app.post("/reply")
def generate_reply(request_data: ReplyRequest): # Use the Pydantic model
    try:
        # Pass the API key to the reply function
        reply_text = email_reply(
            request_data.email_content,
            request_data.privacy_mode,
            request_data.openai_api_key
        )
        return {"reply": reply_text}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error during reply generation: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during reply generation.")

# Example of how to run, if this is the main script:
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)