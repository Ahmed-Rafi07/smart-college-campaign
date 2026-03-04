# OpenAI API Key Setup Guide

## ⚠️ Current Issue
Your backend is crashing because `OPENAI_API_KEY` in `.env` is set to a placeholder value:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## ✅ How to Fix

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/api/keys
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the key (it looks like: `sk-...`)

### Step 2: Update `.env` File
Edit `backend/.env` and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-your_actual_key_here
```

### Step 3: Restart Backend
In the backend terminal:
```bash
Ctrl + C  (stop current process)
nodemon server.js
```

You should now see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## 🛡️ Safety Features Added
I've added protection to your code so the backend won't crash if the API key is missing:
- AI routes now check if the OpenAI client is available
- If key is missing/invalid, users get a friendly error message instead of server crash
- Warning message in console: `⚠️ WARNING: OpenAI API key missing or invalid. AI routes will be disabled.`

## 🔗 Frontend Connection
✅ Frontend is correctly configured to connect to `http://localhost:5000/api/subjects`
Once the backend runs properly, all data will load successfully.

## 📁 Files Modified
- `backend/routes/aiRoutes.js` - Added safety checks for missing API key
