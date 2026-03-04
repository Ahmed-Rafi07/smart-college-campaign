# ✅ Pre-Testing Checklist

## 🔧 Setup Verification

Before testing, verify everything is set up correctly:

### Backend Setup
```
☐ MongoDB is running
  → Open terminal: mongo (or mongosh)
  → Should connect without errors

☐ Backend dependencies installed
  → Folder: backend/
  → File exists: node_modules/
  → Command: npm list (shows packages)

☐ .env file configured
  → File: backend/.env
  → Has: MONGO_URI, JWT_SECRET, PORT=5000
  → No empty values

☐ Backend server starts
  → Command: npm run dev
  → Shows: "Server running on port 5000"
  → No red errors in terminal
```

### Frontend Setup
```
☐ Frontend dependencies installed
  → Folder: frontend/
  → File exists: node_modules/
  → Command: npm list (shows packages)

☐ Frontend server starts
  → Command: npm run dev
  → Shows: "VITE ready in XXXms"
  → Shows: "Local: http://localhost:517X"
  → No red errors in terminal

☐ Browser can access frontend
  → Visit: http://localhost:5175
  → Page should load
  → No blank page or errors
```

### Network Connectivity
```
☐ Backend responds to requests
  → Visit: http://localhost:5000
  → Should get some response
  → (not a blank page)

☐ Frontend can reach backend
  → Open DevTools (F12)
  → Go to Network tab
  → Try any action (login, etc)
  → Should see API requests
  → (Check for /api/auth/login, etc)

☐ Database is accessible
  → Backend terminal should show: "Connected to MongoDB"
  → If shows "ECONNREFUSED" → MongoDB not running
```

---

## 🧪 Feature Testing

### Login Feature
```
☐ Go to login page
  → URL: http://localhost:5175/login
  → Page loads
  → Has email + password fields

☐ Enter valid credentials
  → Email: test@college.edu (or valid user)
  → Password: correct password
  → Click Login

☐ Check console logs
  → Open DevTools (F12)
  → Go to Console tab
  → Should see: 🔐 Login Request
  → Should see: 🔐 Login Response Status
  → Should see: 🔐 Login Response Data
  → Should see: ✅ Login successful

☐ Redirects to dashboard
  → Should go to /student page
  → Shows student dashboard
  → Top bar shows welcome message

☐ Data saved
  → Open DevTools → Application → LocalStorage
  → Should have: "token" (long string)
  → Should have: "user" (JSON with name, email, role)
```

### Admin Feature
```
☐ Login as admin
  → Use admin credentials
  → Should redirect to /admin page

☐ Admin Dashboard loads
  → Shows title: "🛡️ Admin Dashboard"
  → Shows stats cards (users, students, admins, faculty)
  → Shows charts (User Growth, Attendance Trend)

☐ Check charts render
  → Charts should have data
  → No "width(-1)" or "height(-1)" errors in console
  → Lines/bars visible

☐ Home button works
  → Click 🏠 Home button
  → Should go to home page
  → Can click Dashboard to go back

☐ Admin links visible
  → Home page shows: ADMIN badge
  → Home page shows: 🛡️ Admin Panel button
```

### Student Features
```
☐ Login as student
  → Should redirect to /student page

☐ Dashboard loads
  → Shows sidebar with menu items
  → Shows: Dashboard, Subjects, Attendance, Assignments, Notes, etc

☐ Student can't access admin
  → Try URL: http://localhost:5175/admin
  → Should redirect to /student
  → OR show access denied message

☐ Admin panel link not visible
  → Look at sidebar
  → Should NOT see "🛡️ Admin Panel"
  → Should NOT see ADMIN badge on home page

☐ Notes feature
  → Click Notes in sidebar
  → Or visit: http://localhost:5175/notes
  → Page loads
  → Can create note
  → Check console for 📝 logs
  → Note appears in list
```

### Chart Features
```
☐ Attendance chart
  → StudentDashboard → Dashboard tab
  → Should see: 🥧 Overall Attendance (pie chart)
  → Should see: 📊 Attendance Overview (bar chart)
  → No width(-1) errors

☐ Attendance timeline
  → Should see: 📅 Recent Attendance
  → Shows list of attendance records
  → Each shows subject + date + status

☐ Charts have data
  → If data exists: chart shows values
  → If no data: shows placeholder message
  → Never crashes or shows blank
```

### Navigation
```
☐ Home page loads
  → Visit: http://localhost:5175/
  → Shows hero section
  → Shows features section
  → Shows illustration image

☐ Navigation works
  → Click "Home" link → goes to /
  → Click "Features" → scrolls to features
  → Click "Contact" → scrolls to footer
  → Click "Dashboard" → goes to /student

☐ Responsive design
  → Resize browser window
  → Layout should adapt
  → Mobile view should be readable
  → No horizontal scrollbar
```

---

## 🚨 Error Checking

### Console Errors
```
☐ Open DevTools (F12)
☐ Go to Console tab
☐ Check for red X marks (errors)
☐ Common safe warnings (ignore):
  - "Some warnings about dependencies"
  - "Source map warnings"

☐ Critical errors (fix if present):
  - "Cannot find module..."
  - "Unexpected token..."
  - "Invalid hook call..."
  - "Cannot read property..."
```

### Network Errors
```
☐ Open DevTools (F12)
☐ Go to Network tab
☐ Perform any action (login, create note, etc)
☐ Check request statuses:
  - Should be 200 (success)
  - 400 = bad request (check console logs)
  - 401 = unauthorized (login again)
  - 500 = server error (check backend)

☐ Look for failed requests
  - Red text = failed
  - Should have 0 failed requests
  - If some fail: check backend is running
```

### Backend Errors
```
☐ Check backend terminal
☐ Look for red text or "error" keyword
☐ Should see: "Server running on port 5000"
☐ Should see: "Connected to MongoDB"

☐ Check for crashes
  - "Cannot find module" = npm install missing
  - "EADDRINUSE" = port 5000 already in use (kill it)
  - "ECONNREFUSED" = MongoDB not running
```

---

## 📊 Data Validation

### Database has data
```
☐ At least 1 user exists
  → Login should work
  → Check: db.users.find() in MongoDB

☐ Test user has subjects
  → StudentDashboard shows subjects
  → Check: db.subjects.find() in MongoDB

☐ Test user has attendance
  → Attendance chart shows data
  → Check: db.attendances.find() in MongoDB
```

### API Responses Correct
```
☐ Login returns token
  → Response has: "token" field
  → Token is long string starting with "eyJ"

☐ Login returns user object
  → Response has: id, name, email, role
  → Role is one of: "student", "admin", "teacher"

☐ Notes returns array
  → Response is array: [{ ... }, { ... }]
  → Each note has: _id, content, createdAt

☐ API errors are clear
  → Error responses have "message" field
  → Message explains what went wrong
  → Status codes are appropriate
```

---

## 🎯 Post-Testing Actions

### If Everything Works ✅
```
☐ Take a screenshot
☐ Document working features
☐ Write test cases for future bugs
☐ Plan next features to build
☐ Celebrate! 🎉
```

### If Something Breaks ❌
```
☐ Note which feature broke
☐ Check console for error messages
☐ Check Network tab for failed requests
☐ Check backend terminal for errors
☐ Try to restart both (Ctrl+C then npm run dev)
☐ Ask for help with:
  - Error messages
  - Console screenshots
  - Network tab screenshots
  - What action caused the issue
```

---

## 📝 Sign-Off Checklist

After testing everything:

```
☐ Login works with correct credentials
☐ Admin can access /admin page
☐ Student cannot access /admin page
☐ Charts render without errors
☐ Notes can be created/read/updated/deleted
☐ Home page loads and is responsive
☐ Navigation links work
☐ No critical console errors
☐ No failed API requests
☐ Backend is running without errors
☐ Frontend is running without errors
☐ Database has test data
```

**If all checked:** Your app is ready! ✅

---

## 🔄 Testing Frequency

```
Daily:
- Quick smoke test (login, view dashboard)
- Check for console errors
- Verify API responses

Before committing code:
- Test the feature you changed
- Test related features
- Check console/network tabs
- Run full checklist above

Before showing to someone:
- Test on different browsers (Chrome, Firefox, Edge)
- Test on mobile view
- Have backup MongoDB data
- Have test accounts ready
```

---

## 📞 If You Get Stuck

| Problem | First Try | Second Try |
|---------|-----------|------------|
| Blank page | Refresh (F5) | Restart frontend (Ctrl+C, npm run dev) |
| API 500 error | Check backend logs | Restart backend |
| Charts not showing | Refresh page | Check if data exists |
| Can't login | Check email/password | Check user exists in DB |
| LocalStorage empty | Check browser console | Clear cache (Ctrl+Shift+Delete) |

---

**Status:** Ready for Testing ✅
**Date:** February 5, 2026
**Next:** Begin testing and report issues
