from llm import email_summarizer
from fastapi import FastAPI , HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

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

@app.get("/")
def read_root():
    return {"messages" : "Welcome to the Email Summarizer Backend!"}

@app.post("/summarize")
def summarize(body: dict):
    email = body["email"]
    model = body["model"]
    print(email)
    print(type(email))
    # data = email_summarizer(email)
    # print(data)
    cleaned_json_data = email_summarizer(email, model).strip('```json\n').strip('```')
    data = json.loads(cleaned_json_data)
    return data


# json_Data = "```json\n{\n  \"summary\": \"Chaitanya Gadhe has a Backend Developer contract role opportunity and is seeking Kalyan Kumar's interest and availability for a discussion.\",\n  \"action_items\": [\n    \"Send Chaitanya Gadhe your CV\",\n    \"Respond with a good time for a quick chat\"\n  ]\n}\n```"
# cleaned_json_data = json_Data.strip('```json\n').strip('```')
# print(type(cleaned_json_data))
# data = json.loads(cleaned_json_data)
# print(type(data))
# print(data)