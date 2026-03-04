# 📚 STEP 7 Quick Reference - Teacher Panel

## What Teachers Can Do

### 1️⃣ Manage Subjects
```
→ Create new subject
→ View all subjects
→ Select subject to manage content
```

### 2️⃣ Post Assignments
```
→ Title (required)
→ Description (optional)
→ Due Date (optional)
→ Visible to all students in class
```

### 3️⃣ Upload Study Notes
```
→ Title (required)
→ Content/Material (required)
→ Tags (optional)
→ Organized per subject
```

### 4️⃣ Schedule Exams
```
→ Title (required)
→ Date (required)
→ Time (optional)
→ View all scheduled exams
```

### 5️⃣ Track Attendance
```
→ View real-time class attendance
→ See per-student status
→ View attendance statistics
→ Generate insights
```

---

## 🎮 How to Use

### Login as Teacher
1. Go to `/login`
2. Enter teacher credentials
3. Role must be "teacher" or "faculty"
4. Redirected to `/teacher` dashboard

### Create a Subject
1. In "Create Subject" box
2. Enter subject name
3. Click "Add Subject"
4. Subject appears in "My Subjects"

### Select Subject & Manage
1. Click on subject card
2. Subject highlights in blue
3. 4 tabs appear below:
   - **📝 Assignments**
   - **📄 Notes**
   - **🗓️ Exams**
   - **📊 Attendance**

### Add Assignment
1. Go to Assignments tab
2. Fill in title (required)
3. Add description (optional)
4. Set due date (optional)
5. Click "Create Assignment"

### Upload Note
1. Go to Notes tab
2. Enter title (required)
3. Enter content (required)
4. Click "Upload Note"

### Create Exam
1. Go to Exams tab
2. Enter exam title (required)
3. Select date (required)
4. Select time (optional)
5. Click "Create Exam"

### View Attendance
1. Go to Attendance tab
2. See statistics:
   - Total records
   - Present count
   - Absent count
3. View attendance table
4. See student names, emails, status, dates

---

## 🔧 API Endpoints (Backend)

```
POST   /api/teacher/subjects              → Create subject
GET    /api/teacher/subjects              → Get all subjects

POST   /api/teacher/assignments           → Create assignment
GET    /api/teacher/assignments/:subjectId → Get assignments

POST   /api/teacher/notes                 → Upload note
GET    /api/teacher/notes/:subjectId      → Get notes

POST   /api/teacher/exams                 → Create exam
GET    /api/teacher/exams/:subjectId      → Get exams

GET    /api/teacher/attendance/:subjectId → Get attendance + stats
```

---

## 📊 Attendance Stats Display

When viewing attendance:
- **Total Records**: All attendance entries
- **Present**: Count of present students
- **Absent**: Count of absent students
- **Table**: Shows:
  - Student name
  - Student email
  - Status (✓ Present or ✗ Absent)
  - Date of record

---

## 🎨 UI Layout

```
Header
├─ 👩‍🏫 Teacher Dashboard
├─ Welcome message
└─ Logout button

Body
├─ Create Subject (input + button)
├─ My Subjects (grid of cards)
└─ Subject Management (when selected)
   ├─ Tab: Assignments
   │  ├─ Create form
   │  └─ List display
   ├─ Tab: Notes
   │  ├─ Create form
   │  └─ List display
   ├─ Tab: Exams
   │  ├─ Create form
   │  └─ List display
   └─ Tab: Attendance
      ├─ Statistics (3 cards)
      └─ Table
```

---

## 🔒 Security

✅ Only teachers can access `/teacher`
✅ All data tied to teacher's ID
✅ JWT authentication required
✅ Role-based access control
✅ Input validation on backend

---

## 📱 Responsive Breakpoints

**Mobile:** 
- 1 column subjects grid
- Stacked forms
- Scrollable tabs

**Tablet:**
- 2 column subjects grid
- Spacious layout

**Desktop:**
- 3 column subjects grid
- Full-width forms

---

## ✨ Features at a Glance

| Feature | Status |
|---------|--------|
| Create Subjects | ✅ |
| Post Assignments | ✅ |
| Upload Notes | ✅ |
| Schedule Exams | ✅ |
| View Attendance | ✅ |
| Statistics | ✅ |
| Tab Navigation | ✅ |
| Responsive Design | ✅ |
| Error Handling | ✅ |
| Data Validation | ✅ |

---

## 🎯 Typical Teacher Day

1. **Morning** - Login to check attendance
2. **During Class** - Upload notes, create assignments
3. **Afternoon** - Schedule upcoming exams
4. **Evening** - Review student attendance trends

---

## 💡 Tips for Teachers

- **Organize by Subject**: Create different subjects for different classes
- **Set Due Dates**: Help students manage assignments
- **Use Notes Tab**: Share study materials and resources
- **Schedule Exams**: Plan ahead for exam dates
- **Check Attendance**: Monitor which students are present

---

## 🐛 Troubleshooting

**Can't see Teacher Dashboard?**
- Check if role is "teacher" or "faculty"
- Try refreshing page
- Clear browser cache

**Subjects not loading?**
- Check internet connection
- Verify token is valid
- Check browser console for errors

**Assignment not saving?**
- Ensure title is entered
- Check all fields are valid
- Try again in a few seconds

**Attendance not showing?**
- Select a subject first
- Check if attendance records exist
- Verify students have taken classes

---

## 🚀 Ready to Use!

Both servers running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5174`

Create a test teacher account and start exploring! 🎓

---

**Next:** STEP 8 - Analytics & Insights Dashboard 📈
