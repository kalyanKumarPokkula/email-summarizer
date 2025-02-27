# AI-Powered Gmail Summarizer 🚀

## Overview
This project is an AI-powered email summarizer that extracts key points and action items from email content and reply to a mail. It uses LangChain with either OpenAI's GPT-4o-mini or the local Mistral model (via Ollama) to generate concise and structured JSON summaries of emails.


## Features
- Extracts and summarizes email content.
- Identifies key action items from emails.
- Also we can reply to a mail.
- Displays the summary within the Gmail interface
- Supports both OpenAI (gpt-4o-mini) and local (Mistral) models..
- Backend built with FastAPI for handling AI-powered summarization.

## Technologies Used
### Frontend:
- JavaScript (Vanilla JS for DOM manipulation)
- Gmail API integration

### Backend:
- FastAPI (Python)
- LangChain
- OpenAI API (GPT-4o-mini) and Local (mistral)
- Pydantic (Data validation)

## Setup Instructions
### Prerequisites
- Python 3.8+
- Node.js (for frontend development)
- OpenAI API Key

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/kalyanKumarPokkula/email-summarizer.git
   cd email-summarizer/server
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate   # For macOS/Linux
   venv\Scripts\activate      # For Windows
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```sh
   export OPENAI_API_KEY=your_openai_api_key  # macOS/Linux
   set OPENAI_API_KEY=your_openai_api_key     # Windows
   ```
5. Start the FastAPI server:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd ../client
   ```
2. Install dependencies (if applicable):
   ```sh
   npm install  # Optional, if using a package manager
   ```
3. Load the extension:
   - Open **Google Chrome** and go to `chrome://extensions/`.
   - Enable **Developer Mode** (top-right corner).
   - Click **Load unpacked** and select the `frontend/` folder.

### Running the Application
1. Open **Gmail** in your Chrome browser.
2. Click on an email; the summarization tool should appear.
3. Click "Summarize Email" to generate the summary and action items.

## API Endpoints
### 1. Summarize Email
**Endpoint:** `POST /summarize`

**Request:**
```json
{
  "email": "<email_content>",
  "privacy_mode" : "openapi or local"
}
```

**Response:**
```json
{
  "summary": "string",
  "actionItems": ["string1", "string2"]
}
```

## Example Output
**Email:**
> Subject: Action Required: Check System Compatibility
> Dear User, Please test your laptop compatibility for the exam platform...

**AI Output:**
```json
{
  "summary": "Test your laptop for exam compatibility using the provided credentials.",
  "actionItems": [
    "Download SEBLite tool",
    "Disable antivirus & firewall",
    "Ensure system meets exam requirements"
  ]
}
```

### 2. Reply Email
**Endpoint:** `POST /reply`

**Request:**
```json
{
  "email": "<email_content>",
  "privacy_mode" : "openapi or local"
}
```

**Response:**
```json
 String
```

## Future Improvements
- Enhance UI/UX with React.
- Store user preferences and summaries in a database.
- Support summarization for attachments and forwarded emails.

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.



