# Email Summarizer Project Setup

## What's Been Done

We've unified the client and server components into a single project with a streamlined startup process:

1. **Created a single startup script** (`start.py`) that:

   - Checks if required tools are installed
   - Starts the FastAPI server if it's not already running
   - Starts the client build process to watch for changes
   - Provides real-time output from both processes
   - Handles graceful shutdown when stopped

2. **Added performance tracking** to show how long AI summaries take to generate

3. **Implemented privacy mode toggle** that:

   - Defaults to off (false)
   - Can be toggled in the sidebar
   - Sends the privacy mode state with each API request

4. **Updated reply functionality** to:

   - Use the server API instead of direct Ollama calls
   - Include the privacy mode setting
   - Handle response formatting correctly

5. **Created detailed documentation** on how to use the combined project

## How to Use

Simply run the Python script:

```
./start.py
```

This will:

- Start the server (if not already running)
- Build and watch the client for changes
- Open the Chrome extensions page

## Technical Details

### Server Endpoint Changes

Both endpoints now accept a `privacy_mode` parameter:

```
POST /summarize
{
  "email": "...",
  "privacy_mode": true|false
}

POST /reply
{
  "email": "...",
  "privacy_mode": true|false
}
```

### Privacy Mode Implementation

A global `privacyMode` variable in the sidebar component tracks the state, and the toggle switch updates it. The state is accessed by other components through the exported `getPrivacyMode()` function.

### Performance Tracking

Each summary request now tracks and displays the time taken to generate the summary, giving users feedback on the performance of the AI processing.

## Next Steps

1. **Install any missing dependencies** if needed:

   ```
   cd client && npm install
   cd ../server && pip install -r requirements.txt
   ```

2. **Test the unified setup** to ensure everything works correctly

3. Consider adding:
   - User settings persistence
   - Additional AI models or features
   - Improved error handling and recovery
