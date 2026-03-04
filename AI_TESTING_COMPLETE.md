# 🧪 AI Module Testing Guide

## ✅ Pre-Test Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173` (or similar)
- [ ] MongoDB connected
- [ ] GROQ_API_KEY set in `.env`
- [ ] User account created and logged in

---

## 🧪 Test Cases

### Test 1: Basic Chat Functionality
**Goal:** Verify AI responds and stores messages

Steps:
1. Navigate to Student Dashboard
2. Ensure logged in
3. Open AI Helper component (right column)
4. Type: "What is DBMS?"
5. Select subject: "DBMS"
6. Click "Send"

Expected Results:
- ✅ AI responds with DBMS explanation
- ✅ Message appears in chat (user right, AI left)
- ✅ No errors in console

---

### Test 2: Chat History Per Subject
**Goal:** Verify separate chats for different subjects

Steps:
1. In AI Helper, send message in "DBMS"
2. Change subject dropdown to "OS"
3. Should see empty chat

Expected Results:
- ✅ Chat history cleared for new subject
- ✅ Previous DBMS messages not visible
- ✅ Can send new message in OS

---

### Test 3: Voice Input
**Goal:** Test speech-to-text functionality

Steps:
1. Click 🎤 button in AI Helper
2. Wait for "Listening..." 
3. Say: "What is an operating system?"
4. Stop speaking

Expected Results:
- ✅ Button shows "🎤 Listening..."
- ✅ Transcript appears in input field
- ✅ Can send the voice message

---

### Test 4: PDF Export
**Goal:** Export chat as PDF

Steps:
1. Have some messages in chat
2. Click "📥 Export PDF" button
3. File should download

Expected Results:
- ✅ PDF downloads
- ✅ Filename includes subject and timestamp
- ✅ PDF contains all chat messages

---

### Test 5: Study Planner
**Goal:** Test AI study plan generation

Steps:
1. Go to the grid area with three panels
2. Find "📚 AI Study Planner" (right column)
3. Set Days: 7
4. Add subjects: DBMS, OS (one at a time)
5. Click "Generate Study Plan"

Expected Results:
- ✅ Shows "Generating Plan..."
- ✅ Returns 7-day study schedule
- ✅ Includes both subjects
- ✅ Plan shows day-by-day tasks

---

### Test 6: Exam Integration
**Goal:** Test AI study plan for specific exam

Steps:
1. Scroll to "📝 Upcoming Exams" section
2. Add an exam:
   - Title: "DBMS Final"
   - Subject: "DBMS"
   - Date: 7 days from now
3. Click "🤖 Study Plan" button on exam
4. Click "Generate AI Study Plan"

Expected Results:
- ✅ Form appears below exam
- ✅ AI plan generates with 7-day schedule
- ✅ Plan focuses on DBMS
- ✅ Includes number of days remaining

---

### Test 7: Offline Fallback
**Goal:** Test graceful degradation when AI unavailable

Steps:
1. Turn off internet OR
2. Temporarily remove GROQ_API_KEY from .env
3. Try sending a message

Expected Results:
- ✅ Shows offline indicator
- ✅ Fallback message appears
- ✅ Message still saved to chat
- ✅ No app crash

---

### Test 8: Multi-User Memory
**Goal:** Verify chat isolation between users

Steps:
1. User A sends message in DBMS
2. User A logs out
3. User B logs in
4. Select DBMS subject
5. Should NOT see User A's messages

Expected Results:
- ✅ Different users see different chats
- ✅ userId properly extracted from JWT
- ✅ Chat history is private per user

---

## 📊 Expected Behaviors

| Action | Expected | Status |
|--------|----------|--------|
| Send message | AI responds | ? |
| Select different subject | Chat clears | ? |
| Click voice button | Input captured | ? |
| Export PDF | File downloads | ? |
| Generate study plan | Schedule appears | ? |
| Test offline | Graceful fallback | ? |

---

## 🐛 Debugging Tips

### If AI doesn't respond:
```
1. Check GROQ_API_KEY in backend/.env
2. Verify API quota not exceeded
3. Check browser console for errors
4. Check backend server logs
```

### If chat history not loading:
```
1. Ensure user logged in
2. Check MongoDB connection
3. Verify token in Authorization header
4. Check AIChat collection in MongoDB
```

### If PDF export fails:
```
1. Check browser console for errors
2. Verify jspdf and html2canvas installed
3. Check if chatBoxRef is properly set
4. Try clearing browser cache
```

### If voice input not working:
```
1. Only works on Chrome/Edge
2. Requires HTTPS in production
3. User must grant microphone permission
4. Check browser console for errors
```

---

## 📝 Sample Test Data

### Quick Test Messages:
- "Explain OOP in programming"
- "What is database normalization?"
- "How does an operating system work?"
- "Create a 3-day study plan"
- "What is a linked list?"

### Test Exam Setup:
```
Title: Midterm Exam
Subject: DBMS
Date: 7 days from now
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ Chat messages save & load
- ✅ Subject selection works
- ✅ Voice input captures speech
- ✅ PDF exports properly
- ✅ Study plans generate
- ✅ Exams show inline AI plans
- ✅ Offline mode graceful
- ✅ Multi-user isolation works
- ✅ No console errors
- ✅ No 401/403 auth errors

---

🎉 **Ready to test? Go for it!**
