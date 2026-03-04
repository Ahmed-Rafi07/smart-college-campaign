# 🚨 Quick Troubleshooting Guide

## Issue: Login shows 400 Error

### 🔍 Debug Steps:

1. **Open Browser DevTools** (Press `F12`)
2. **Go to Console tab**
3. Try logging in again
4. Look for blue `🔐 Login Request:` log
   - Should show: `{email: "your@email.com", password: "yourpass"}`
   - If missing → input fields are empty

5. Look for `🔐 Login Response Status:`
   - Should show: `200 OK`
   - If shows `400` → error from backend

6. Check `🔐 Login Response Data:`
   - Should have `token` and `user` object
   - If has `message: "Invalid credentials"` → wrong email/password

### ✅ Fix:
- Verify email exists in database
- Check password is correct
- Ensure both fields are filled
- Try: `test@college.edu` with correct password

---

## Issue: Charts show blank or error

### 🔍 Debug Steps:

1. **Inspect chart container** (Right-click → Inspect)
2. Look for `<div class="w-full h-64">` or similar
3. Check CSS shows height > 0
   - Should show `height: 256px` or similar
   - If shows `height: 0px` → problem!

4. **Open Console** (F12)
5. Look for any errors mentioning "width(-1)" or "height(-1)"

### ✅ Fix:
Make sure chart is wrapped:
```jsx
<div className="w-full h-64">  {/* Add this! */}
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* chart content */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

---

## Issue: Notes page empty or errors

### 🔍 Debug Steps:

1. **Check Network Tab** (F12 → Network)
2. Click Notes in sidebar
3. Look for `GET /api/notes` request
4. Click it → check Status
   - Should be `200` (success)
   - If `401` → token missing/invalid
   - If `500` → backend error

5. Click **Response** tab
   - Should show array of notes: `[{...}, {...}]`
   - If empty array `[]` → no notes created yet

6. **Check Console** for `📝` logs
   - Should show: `📝 Fetching notes for user: ...`
   - Should show: `📝 Found notes: 0` (or more)

### ✅ Fix:
- If no notes: That's normal! Create a new note first
- If 401 error: Token expired, login again
- If 500 error: Backend not running or database issue
- If logs missing: Check browser is not blocking logs

---

## Issue: Backend not responding

### 🔍 Debug Steps:

1. **Check backend is running**
   - Terminal should show: `Server running on port 5000`
   - Try visiting: `http://localhost:5000` in browser
   - Should show some response (not blank page)

2. **Check .env file exists**
   - File: `backend/.env`
   - Should have: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`

3. **Check MongoDB**
   - Backend logs should show: `Connected to MongoDB`
   - If missing → database not connected

4. **Check terminal for errors**
   - Red text in backend terminal = problems
   - Look for "ECONNREFUSED" → MongoDB not running
   - Look for "Cannot find module" → missing dependency

### ✅ Fix:
```bash
# Kill existing process
# In backend terminal: Ctrl+C

# Reinstall dependencies
cd backend
npm install

# Start fresh
npm run dev
```

---

## Issue: Frontend not loading

### 🔍 Debug Steps:

1. **Check frontend is running**
   - Terminal should show: `VITE v7.x.x ready in 300ms`
   - Try visiting: `http://localhost:5175` (or 5173/5174)
   - Page should load (not blank)

2. **Check for build errors**
   - Terminal may show orange/red warnings
   - Try to fix: look for "Failed to compile" message

3. **Check browser console** (F12)
   - Any red errors?
   - Common: "Cannot find module" or "Unexpected token"

### ✅ Fix:
```bash
# Kill existing process
# In frontend terminal: Ctrl+C

# Clear cache
rm -r node_modules
npm install

# Start fresh
npm run dev
```

---

## Issue: Can't see Admin Dashboard

### 🔍 Debug Steps:

1. **Check your user role**
   - Open DevTools Console (F12)
   - Type: `JSON.parse(localStorage.getItem("user"))`
   - Should show `role: "admin"`
   - If `role: "student"` → you're not admin!

2. **Check token exists**
   - Type: `localStorage.getItem("token")`
   - Should show long string starting with `eyJ...`
   - If `null` → not logged in

3. **Try accessing `/admin` directly**
   - Go to: `http://localhost:5175/admin`
   - Should load if you're admin
   - If redirects elsewhere → not authorized

### ✅ Fix:
- Login with admin account (if you have one)
- Create admin account in database manually:
  ```javascript
  // In MongoDB:
  db.users.create({
    username: "admin",
    email: "admin@college.edu",
    password: "hashed_password",
    role: "admin"
  })
  ```

---

## Issue: Data not persisting (after refresh)

### 🔍 Debug Steps:

1. **Check localStorage**
   - Open DevTools (F12) → Application → LocalStorage
   - Should see: `token`, `user`
   - If empty → didn't save properly

2. **Check MongoDB**
   - Connect to MongoDB
   - Check database has data in collections
   - If empty → data not saved to database

3. **Check API response**
   - Network tab → look at POST/PUT requests
   - Status should be `200`
   - Response should show created object with `_id`

### ✅ Fix:
- Verify database is running
- Check API returns 200 status
- Check localStorage is not blocked by browser

---

## Quick Command Reference

```bash
# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm run dev

# Kill port (if stuck)
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# View MongoDB
# In MongoDB Atlas or local:
db.users.find()
db.notes.find()

# Reset everything
rm -rf node_modules package-lock.json
npm install
```

---

## Contact Backend API

### Base URL: `http://localhost:5000`

**Key Endpoints:**
- `POST /api/auth/login` → Login
- `POST /api/auth/register` → Register
- `GET /api/notes` → Get notes
- `POST /api/notes` → Create note
- `GET /api/attendance/summary` → Attendance stats
- `GET /api/admin/analytics` → Admin stats

---

## Still Stuck?

✅ **Check these in order:**
1. Is backend terminal running? (no red errors?)
2. Is frontend terminal running? (no red errors?)
3. Open `http://localhost:5000` → responds?
4. Open `http://localhost:5175` → loads?
5. Can you login? (check console for logs)
6. Check Network tab (F12) → any 500 errors?
7. Restart both (kill + npm run dev)

If all above pass → your setup is correct! 🎉
