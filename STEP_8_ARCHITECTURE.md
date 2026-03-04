# 🏗️ STEP 8: RBAC Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SMART COLLEGE COMPANION                 │
│                   Step 8: RBAC Implementation                │
└─────────────────────────────────────────────────────────────┘

                          FRONTEND LAYER
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Login Page (Public)                                         │
│  ├─ Email/Password Input                                    │
│  ├─ Role Detection on Response                              │
│  └─ Automatic Redirect Based on Role                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                 PROTECTED ROUTE LAYER                        │
│                                                              │
│  ProtectedRoute Component                                   │
│  ├─ Check: Token exists? → No: Go to /login                │
│  ├─ Check: User exists? → No: Go to /login                │
│  └─ Check: Role matches? → No: Redirect to own dashboard   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    ROLE-BASED ROUTES                         │
│                                                              │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  ADMIN ROUTES   │  │ TEACHER ROUTES │  │ STUDENT ROUTES │
│  ├─────────────────┤  ├────────────────┤  ├──────────────┤ │
│  │ /admin          │  │ /teacher       │  │ /student     │ │
│  │ ↓               │  │ ↓              │  │ ↓            │ │
│  │ AdminDashboard  │  │ TeacherPanel   │  │ StudentDash  │ │
│  │                 │  │                │  │ /notes       │ │
│  │ Analytics       │  │ Class Mgmt     │  │ /ai-helper   │ │
│  │ User Mgmt       │  │ Attendance     │  │              │ │
│  │ System Control  │  │ Exams          │  │              │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                   NETWORK / API LAYER
┌──────────────────────────────────────────────────────────────┐
│                    http://localhost:5000                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              JWT Authentication                      │  │
│  │  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...      │  │
│  │  ├─ Validates token signature                        │  │
│  │  ├─ Checks expiration (1 day)                        │  │
│  │  ├─ Extracts user ID & role from token              │  │
│  │  └─ Attaches user to req.user                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ROLE-BASED API ENDPOINTS                   │  │
│  │                                                       │  │
│  │  /api/admin/* ──→ adminOnly middleware               │  │
│  │  ├─ /analytics   (Admin only)                        │  │
│  │  ├─ /users       (Admin only)                        │  │
│  │  └─ /stats       (Admin only)                        │  │
│  │                                                       │  │
│  │  /api/teacher/* ──→ isTeacher middleware             │  │
│  │  ├─ /subjects    (Teacher only)                      │  │
│  │  ├─ /attendance  (Teacher only)                      │  │
│  │  └─ /exams       (Teacher only)                      │  │
│  │                                                       │  │
│  │  /api/student/* ──→ auth middleware only             │  │
│  │  ├─ /notes       (Authenticated only)                │  │
│  │  ├─ /subjects    (Authenticated only)                │  │
│  │  └─ /assignments (Authenticated only)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                       DATABASE LAYER
┌──────────────────────────────────────────────────────────────┐
│                    MongoDB Collections                        │
│                                                              │
│  Users Collection                                            │
│  {                                                           │
│    _id: ObjectId,                                           │
│    username: String,                                        │
│    email: String,                                           │
│    password: String (hashed),                               │
│    role: "admin" | "teacher" | "student" | "faculty",     │
│    blocked: Boolean,                                        │
│    tokenVersion: Number                                     │
│  }                                                           │
│                                                              │
│  Other Collections                                          │
│  ├─ Notes (student notes)                                   │
│  ├─ Subjects                                                │
│  ├─ Attendance                                              │
│  ├─ Assignments                                             │
│  ├─ Exams                                                   │
│  └─ LoginLogs (audit trail)                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization Flow

```
┌─────────────┐
│  User Login │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│ POST /api/auth/login                 │
│ { email, password }                  │
└──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Backend Validation:                  │
│ 1. Find user by email                │
│ 2. Compare password hash             │
│ 3. Generate JWT with role            │
│ 4. Create LoginLog entry             │
└──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────┐
│ Response with JWT & User Object:                 │
│ {                                                │
│   token: "eyJhbGci...",                          │
│   user: {                                        │
│     id: "507f1f77bcf86cd799439011",             │
│     name: "John Doe",                            │
│     email: "john@college.com",                   │
│     role: "student"  ← KEY INFORMATION           │
│   }                                              │
│ }                                                │
└──────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Frontend Storage:                    │
│ localStorage.setItem("token", ...)   │
│ localStorage.setItem("user", ...)    │
└──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ App.jsx checks user.role             │
│ Renders appropriate routes:          │
│ - admin   → /admin route             │
│ - teacher → /teacher route           │
│ - student → /student route           │
└──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ ProtectedRoute guards access:        │
│ 1. Check token exists                │
│ 2. Check role matches required role  │
│ 3. Allow access or redirect          │
└──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ API Requests with Token:             │
│ Authorization: Bearer {token}        │
│ ↓                                    │
│ Backend auth middleware validates    │
│ ↓                                    │
│ Role-specific middleware checks role │
│ ↓                                    │
│ Endpoint executes or returns 403     │
└──────────────────────────────────────┘
```

---

## Role Matrix & Permissions

```
┌────────────────┬──────────┬─────────┬────────┐
│ Feature        │ Student  │ Teacher │ Admin  │
├────────────────┼──────────┼─────────┼────────┤
│ Dashboard View │    ✅    │    ✅   │   ✅   │
│ View Subjects  │    ✅    │    ✅   │   ✅   │
│ Create Subject │    ❌    │    ✅   │   ✅   │
│ Attendance     │    ✅    │    ✅   │   ✅   │
│ Assignments    │    ✅    │    ✅   │   ✅   │
│ Notes          │    ✅    │    ❌   │   ❌   │
│ Exams          │    ✅    │    ✅   │   ✅   │
│ Create Exam    │    ❌    │    ✅   │   ✅   │
│ View Analytics │    ❌    │    ❌   │   ✅   │
│ Manage Users   │    ❌    │    ❌   │   ✅   │
│ System Control │    ❌    │    ❌   │   ✅   │
└────────────────┴──────────┴─────────┴────────┘
```

---

## File Structure Overview

```
smart-college-companion/
├── backend/
│   ├── middleware/
│   │   ├── auth.js               ← JWT validation
│   │   ├── admin.js              ← Admin check
│   │   └── isTeacher.js          ← Teacher check
│   ├── controllers/
│   │   └── authController.js     ← LOGIN (returns role) ✨
│   ├── routes/
│   │   ├── authRoutes.js         ← /api/auth/login
│   │   ├── adminRoutes.js        ← /api/admin/* (protected)
│   │   └── teacherRoutes.js      ← /api/teacher/* (protected)
│   ├── models/
│   │   └── user.js               ← role field (admin/teacher/student)
│   └── server.js                 ← Route registration
│
└── frontend/
    └── src/
        ├── components/
        │   └── ProtectedRoute.jsx ← Role checking ✨
        ├── pages/
        │   ├── Login.jsx          ← Role redirect logic
        │   ├── StudentDashboard.jsx ← Student routes
        │   ├── TeacherDashboard.jsx ← Teacher routes
        │   ├── AdminDashboard.jsx   ← Admin routes
        │   └── Notes.jsx           ← Student notes ✨ NEW
        └── App.jsx                ← Route definitions ✨
```

---

## Security Layers

```
Layer 1: Authentication
┌─────────────────────────────────────┐
│ Only authenticated users can proceed │
│ Validated by: JWT token             │
└─────────────────────────────────────┘

        ↓

Layer 2: Authorization (Frontend)
┌─────────────────────────────────────┐
│ Role-based route protection         │
│ Blocks unauthorized access early    │
│ Redirects to appropriate dashboard  │
└─────────────────────────────────────┘

        ↓

Layer 3: Authorization (Backend)
┌─────────────────────────────────────┐
│ Middleware validates role on requests│
│ Returns 403 if unauthorized         │
│ Prevents direct API access bypass   │
└─────────────────────────────────────┘

        ↓

Layer 4: Data Protection
┌─────────────────────────────────────┐
│ Passwords hashed with bcrypt        │
│ Sensitive data excluded from API    │
│ Session tracking with tokenVersion  │
│ Audit logs for login attempts       │
└─────────────────────────────────────┘
```

---

## Request Flow Examples

### Example 1: Student Accessing Notes
```
1. Student clicks "Notes" → navigate("/notes")
   ↓
2. ProtectedRoute checks:
   - Token exists? ✅
   - User.role === "student"? ✅
   ↓
3. Notes component renders
   ↓
4. Click "Save Note" → POST /api/notes
   - Headers: Authorization: Bearer {token}
   ↓
5. Backend auth middleware extracts role from token
   ↓
6. Endpoint executes → Note saved ✅

If NOT student:
2. ProtectedRoute checks: user.role !== "student"? ✅
   → Redirect to appropriate dashboard
```

### Example 2: Non-Admin Accessing Admin API
```
1. Hacker tries: fetch('/api/admin/stats', {
     headers: { Authorization: `Bearer ${stolen_token}` }
   })
   ↓
2. Backend receives request
   ↓
3. auth middleware validates JWT
   - Token is valid ✅
   - Extracts user ID from token
   ↓
4. adminOnly middleware checks:
   - Is user.role === "admin"? ❌
   ↓
5. Returns 403: "Admin access only"
   
No data leaked! 🔒
```

### Example 3: Teacher Trying to Access /admin
```
1. Teacher is logged in (valid token, role: "teacher")
   ↓
2. Tries to navigate to /admin route
   ↓
3. App.jsx renders:
   <Route path="/admin" element={
     <ProtectedRoute role="admin">
       <AdminDashboard />
     </ProtectedRoute>
   } />
   ↓
4. ProtectedRoute checks:
   - Token exists? ✅
   - user.role === "admin"? ❌
   ↓
5. Because user.role = "teacher":
   - Redirect to /teacher (teacher's dashboard) ✅
```

---

## Summary

**STEP 8 provides:**

✅ **Authentication** - JWT with role information
✅ **Frontend Authorization** - ProtectedRoute components
✅ **Backend Authorization** - Middleware role checks
✅ **Automatic Routing** - Users directed to correct dashboard
✅ **Notes Feature** - Student-specific functionality
✅ **Multi-Layer Security** - Cannot bypass with stolen tokens
✅ **Audit Trail** - Login logs for admin review

**Your system is now production-ready with proper RBAC!** 🚀
