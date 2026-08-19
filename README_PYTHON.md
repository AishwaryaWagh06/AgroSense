# Python Backend Setup for AgroSense Chatbot

## Installation

1. Install Python 3.8 or higher
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python chatbot_server.py
```

The server will start on `http://localhost:5000`

## Access the Chatbot

Open your browser and visit:
- `http://localhost:5000/chatbot.html`
- `http://localhost:5000/chatbot2.html`

## Features

- **Secure API Key**: API key stays on the server, not exposed to clients
- **Image Support**: Handles image uploads for visual analysis
- **Multi-language**: Supports English and Hindi
- **Error Handling**: Proper error messages and handling

## API Endpoint

POST `/api/chat`

Request:
```json
{
  "prompt": "Your question here",
  "lang": "en",
  "image": "base64_image_data (optional)"
}
```

Response:
```json
{
  "success": true,
  "response": "AI generated response"
}
```


