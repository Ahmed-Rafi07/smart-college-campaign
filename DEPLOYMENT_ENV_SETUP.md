# 🚀 Deployment Environment Variables Setup

## ⚠️ IMPORTANT: API Keys Must Be Set in Deployment

Your `.env` file is **NOT uploaded** to deployment platforms. Therefore, you must manually set environment variables in your deployment platform.

---

## 🔑 Required Environment Variables

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=AIza... (your Google Gemini API key)
GROQ_API_KEY=gsk_... (your Groq API key)
OPENAI_API_KEY=sk-... (your OpenAI API key - optional)
PORT=5000
CRON_ENABLED=true
CRON_TIMEZONE=Asia/Kolkata
```

**You need at least ONE of these AI API keys:**
- `GROQ_API_KEY` (recommended - free tier available)
- `OPENAI_API_KEY` (paid)
- `GEMINI_API_KEY` (free tier available)

---

## 📋 Platform-Specific Setup

### 1️⃣ **Render** (Recommended for easy setup)

#### Steps:
1. Go to your Render Dashboard → Select your backend service
2. Navigate to **Settings** → **Environment**
3. Click **Add Environment Variable**
4. Add each key-value pair:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | Your secret key |
   | `GEMINI_API_KEY` | Your Google Gemini API key |
   | `GROQ_API_KEY` | Your Groq API key |
   | `PORT` | `5000` |
   | `CRON_ENABLED` | `true` |

5. Click **Deploy** or **Manual Deploy**
6. Wait for deployment to complete

#### To verify:
- Check server logs for: ✅ `AI provider: Google Gemini`

---

### 2️⃣ **Railway**

#### Steps:
1. Go to Railway Dashboard → Select your project
2. Click on **Variables** tab
3. Click **New Variable**
4. Enter variable name and value
5. Add all required variables
6. Service automatically redeploys

#### Verify:
- Check logs for AI provider confirmation

---

### 3️⃣ **Vercel** (Frontend only - for backend use Render/Railway)

#### Steps:
1. Go to Vercel Dashboard → Select project
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter variable name and value
5. Select environments: **Production, Preview, Development**
6. Click **Save**
7. Redeploy project

**Note:** Vercel is better for frontend. Use **Render** or **Railway** for your Express backend.

---

### 4️⃣ **Netlify** (Frontend only)

#### Steps:
1. Go to Netlify Site Settings
2. Navigate to **Build & Deploy** → **Environment**
3. Click **Edit variables**
4. Add variable name and value
5. Click **Save**
6. Trigger new deployment

---

### 5️⃣ **Heroku** (if still using - deprecated)

#### Steps (via Heroku CLI):
```bash
heroku login
heroku apps:list
heroku config:set MONGO_URI="your_mongodb_uri" --app=your-app-name
heroku config:set GEMINI_API_KEY="your_key" --app=your-app-name
```

#### Via Dashboard:
1. Go to app → **Settings**
2. Click **Reveal Config Vars**
3. Add key-value pairs

---

### 6️⃣ **AWS** (EC2, ECS, or Elastic Beanstalk)

#### For EC2:
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Create .env file
nano /path/to/backend/.env

# Add:
MONGO_URI=your_connection_string
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
```

#### For Elastic Beanstalk:
```bash
eb setenv MONGO_URI=your_uri GEMINI_API_KEY=your_key
```

---

### 7️⃣ **Azure** (App Service)

#### Steps:
1. Go to Azure Portal → Your App Service
2. Navigate to **Settings** → **Configuration**
3. Click **+ New application setting**
4. Add Name and Value
5. Click **OK** and **Save**

---

### 8️⃣ **DigitalOcean** (App Platform)

#### Steps:
1. Go to DigitalOcean App Platform
2. Select your app → **Settings**
3. Go to **Component** → **Environment**
4. Click **Edit** and add variables
5. Deployment automatically triggers

---

## 🔐 Getting Your API Keys

### **Groq API Key** (Recommended - Free Tier)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Go to **API Keys**
4. Create new key
5. Copy format: `gsk_...`

### **Google Gemini API Key** (Free)
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click **Get API Key**
3. Create new API key
4. Copy format: `AIza...`

### **OpenAI API Key** (Paid)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Login
3. Go to **API Keys**
4. Create new key
5. Copy format: `sk-...`

### **MongoDB URI**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Select your cluster
3. Click **Connect**
4. Select **Drivers**
5. Copy connection string with your password

---

## ✅ Verification Checklist

After deploying with environment variables:

- [ ] Backend logs show: ✅ `AI provider: Google Gemini` (or Groq/OpenAI)
- [ ] AI chat works in deployed app
- [ ] No "**" stars in AI responses
- [ ] Database connection works (can see data)
- [ ] JWT authentication works (login/register functions)

---

## 🐛 Troubleshooting

### ❌ Error: "AI authentication failed"
**Solution:** 
- Verify API key is correct in deployment platform
- Check key starts with correct prefix (`gsk_`, `AIza`, or `sk-`)
- Restart/redeploy service

### ❌ Error: "Quota/Billing limit reached"
**Solution:**
- Check AI provider account for usage limits
- Add billing method (for OpenAI)
- Switch to free tier provider (Groq or Gemini)

### ❌ Still seeing `**` in responses
**Solution:**
- Make sure you ran: `npm install` in frontend folder
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild and redeploy frontend

---

## 💡 Quick Reference: Environment Variable Names

```
Backend (.env):
- MONGO_URI
- JWT_SECRET
- PORT
- GEMINI_API_KEY
- GROQ_API_KEY
- OPENAI_API_KEY
- CRON_ENABLED
- CRON_TIMEZONE
- EMAIL (optional)
- EMAIL_PASS (optional)
```

---

## 🎯 Next Steps

1. ✅ Add environment variables to your deployment platform
2. ✅ Restart/redeploy backend
3. ✅ Install dependencies: `npm install` (frontend)
4. ✅ Rebuild frontend
5. ✅ Test AI features in deployed app

**Need help?** Check the error logs in your deployment platform dashboard!

