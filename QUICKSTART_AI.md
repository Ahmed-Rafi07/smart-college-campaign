# 🚀 Quick Start: AI Module

## ⚡ 60-Second Setup

### Step 1: Start Backend
```bash
cd backend
npm install  # (if needed)
node server.js
```
Expected: `✅ MongoDB Connected` + `🚀 Server running on port 5000`

### Step 2: Start Frontend
```bash
cd frontend
npm install  # (if needed)
npm run dev
```
Expected: Server running on `http://localhost:5173`

### Step 3: Login & Test
1. Open http://localhost:5173
2. Login to your account
3. Go to Student Dashboard
4. Find AI Helper (right column)
5. Select "DBMS" from dropdown
6. Type: "What is normalization?"
7. Click Send → AI responds ✅

---

## 🎯 10 Cool Things to Try

### 1. **Chat with AI**
- Select different subjects
- Ask follow-up questions
- AI remembers context!

### 2. **Voice Input 🎤**
- Click microphone button
- Say: "What is a database?"
- Magic happens ✨

### 3. **Export Chat**
- Click "📥 Export PDF"
- Download your chat
- Share with classmates

### 4. **Create Study Plan**
- Go to "📚 AI Study Planner" panel
- Set days: 7
- Add subjects: DBMS, OS
- Click "Generate Study Plan"
- Get 7-day schedule!

### 5. **Exam Integration**
- Go to "📝 Upcoming Exams"
- Add exam: "DBMS Final" (7 days away)
- Click "🤖 Study Plan" button
- See AI-powered 7-day plan for exam

### 6. **Multi-Subject Chat**
- Switch between DBMS, OS, CN, DSA
- Each has separate chat history
- Subjects don't interfere

### 7. **Offline Mode**
- Turn off internet
- Messages still send (stored locally)
- Get offline notification
- When back online, resync

### 8. **Subject-Aware AI**
- Chat knows which subject you're studying
- AI tailors responses accordingly
- Better accuracy!

### 9. **Chat History**
- Reload page → messages still there
- Change subject → return to original
- Persistent memory per subject!

### 10. **Full ChatGPT Experience**
- Modern message bubbles
- User messages on right (blue)
- AI messages on left (gray)
- Smooth scrolling
- Professional UI

---

## 📱 Features Checklist

- ✅ **Chat History** - Saves all messages per subject
- ✅ **AI Memory** - Remembers conversation context
- ✅ **Subject Selection** - 6 subjects available
- ✅ **Voice Input** - Speech-to-text 🎤
- ✅ **PDF Export** - Download your chats 📥
- ✅ **Study Planner** - AI generates schedules
- ✅ **Exam Integration** - Auto-calculate days
- ✅ **Offline Mode** - Graceful fallback
- ✅ **Modern UI** - ChatGPT-style bubbles
- ✅ **Secure** - JWT authentication

---

## 🔧 Troubleshooting

### Issue: "AI failed"
```
✓ Check GROQ_API_KEY in backend/.env
✓ Verify internet connection
✓ Check backend logs
```

### Issue: "Chat not loading"
```
✓ Clear localStorage: localStorage.clear()
✓ Login again
✓ Check MongoDB connection
```

### Issue: "Voice not working"
```
✓ Use Chrome/Edge (not Safari)
✓ Allow microphone permission
✓ Check browser console
```

### Issue: "401 Unauthorized"
```
✓ Login again
✓ Clear localStorage
✓ Check JWT_SECRET in .env
```

---

## 📚 API Quick Reference

```bash
# Chat Endpoint (requires token)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is DBMS?","subject":"dbms"}'

# Get Chat History (requires token)
curl http://localhost:5000/api/ai/history/dbms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate Study Plan (requires token)
curl -X POST http://localhost:5000/api/ai/study-plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days":7,"subjects":["DBMS","OS"]}'
```

---

## 🎓 Learning Resources

### Understanding the AI:
- Groq API: Fast LLM inference
- Llama 3.1: 8B parameters, efficient
- Temperature 0.7: Balanced responses

### Frontend Tech:
- React Hooks for state management
- Web Speech API for voice
- jsPDF for document generation
- html2canvas for screenshot

### Backend Tech:
- Express.js middleware
- MongoDB document storage
- JWT authentication
- Error handling patterns

---

## 📊 What Gets Saved

### In MongoDB:
```javascript
AIChat {
  userId: "user123",
  subject: "DBMS",
  messages: [
    { role: "user", content: "What is normalization?", createdAt: Date },
    { role: "assistant", content: "Normalization is...", createdAt: Date }
  ],
  title: "DBMS Chat",
  createdAt: Date,
  updatedAt: Date
}
```

### In LocalStorage:
```javascript
localStorage.setItem("token", "eyJhbGc...")  // Your JWT
```

---

## 🔐 Security Notes

✓ **Private Chats** - Only you see your messages
✓ **JWT Tokens** - Secure user identification
✓ **Server-side** - AI processing on backend
✓ **No API Keys** - Hidden from frontend
✓ **Offline Safe** - Messages saved locally

---

## ⚙️ Configuration

### Subjects Available:
- general
- dbms
- os
- cn (Computer Networks)
- dsa (Data Structures)
- web

### AI Settings:
```javascript
model: "llama-3.1-8b-instant"
temperature: 0.7  // 0=precise, 1=creative
max_tokens: 512   // Response length
```

### Study Plan Settings:
```javascript
max_days: 30
min_days: 1
max_subjects: 10
```

---

## 📈 Performance Tips

1. **Faster Responses** - AI pre-processes subject context
2. **Less Memory** - Chat window auto-scrolls efficiently
3. **Smart Caching** - Browser caches chat history
4. **Offline Support** - Messages queue locally

---

## 🚀 Next Features (Future Roadmap)

- [ ] Audio output (text-to-speech)
- [ ] Diagram generation
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] Advanced search
- [ ] Chat sharing
- [ ] Study analytics
- [ ] AI tutoring sessions

---

## 💬 Need Help?

Check these files:
- `AI_ARCHITECTURE.md` - System design
- `AI_TESTING_COMPLETE.md` - Testing guide
- `AI_MODULE_IMPLEMENTATION.md` - Feature list
- Backend logs: `npm run dev` (with nodemon)
- Frontend console: DevTools F12

---

## 🎉 You're All Set!

Your AI-powered Smart College Companion is ready to go! 

**Start chatting with your AI study assistant now!** 🤖✨
