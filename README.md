# Email Summarizer

AI-powered email summarizer that works with Gmail to provide summaries, action items, and smart replies.

## Features

- **Email Summary**: Get concise summaries of your emails
- **Action Items**: Extract action items from emails
- **Smart Reply**: Generate context-aware replies
- **Privacy Mode**: Option to enable privacy for sensitive email content
- **Performance Tracking**: See how fast summaries are generated

## Project Structure

```
email-summarizer/
├── client/              # Chrome extension frontend
│   ├── src/             # Source code
│   ├── dist/            # Compiled extension
│   └── ...
├── server/              # FastAPI backend
│   ├── main.py          # Main API endpoints
│   ├── llm.py           # LLM integration
│   └── ...
└── start.py             # Quick start script
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js and npm
- Chrome browser

### Starting the Project

Simply run the start script:

```
./start.py
```

This will:

- Check if the server is running and start it if not
- Build and watch the client for changes
- Open the Chrome extensions page for you to load the extension

## Manual Setup

### Server Setup

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Start the server:
   ```
   uvicorn main:app --reload
   ```

### Client Setup

1. Navigate to the client directory:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build and watch for changes:
   ```
   npm run watch
   ```

## Loading the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `client/dist` directory

## How to Use

1. Open Gmail in Chrome
2. Select an email to read
3. The extension sidebar will appear with:
   - Email summary
   - Action items (if any)
   - Options to copy, double-check, or reply

### Privacy Mode

Toggle privacy mode in the extension sidebar to prevent sending sensitive email content to the summarization service.

## License

ISC
