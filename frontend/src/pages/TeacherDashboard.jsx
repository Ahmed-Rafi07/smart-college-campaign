import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClassCodeGenerator from "../components/ClassCodeGenerator";
import AttendanceProofViewer from "../components/AttendanceProofViewer";

const TeacherDashboard = ({ user }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState(null);

  const [newSubject, setNewSubject] = useState("");
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "" });
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newExam, setNewExam] = useState({ title: "", date: "", time: "" });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");

  // Fetch subjects on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSubjects();
  }, [token, user, navigate]);

  // Fetch assignments, notes, exams when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchAssignments();
      fetchNotes();
      fetchExams();
      fetchAttendance();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/teacher/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubjects(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch subjects error:", err);
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/assignments/${selectedSubject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Fetch assignments error:", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/notes/${selectedSubject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Fetch notes error:", err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/exams/${selectedSubject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error("Fetch exams error:", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/attendance/${selectedSubject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      console.error("Fetch attendance error:", err);
    }
  };

  const addSubject = async () => {
    if (!newSubject.trim()) {
      alert("Please enter subject name");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/teacher/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSubject }),
      });
      const data = await res.json();
      setSubjects([...subjects, data]);
      setNewSubject("");
      alert("Subject created successfully!");
    } catch (err) {
      console.error("Add subject error:", err);
      alert("Failed to create subject");
    }
  };

  const addAssignment = async () => {
    if (!newAssignment.title.trim()) {
      alert("Please enter assignment title");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/teacher/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          subjectId: selectedSubject._id,
        }),
      });
      const data = await res.json();
      setAssignments([...assignments, data]);
      setNewAssignment({ title: "", description: "", dueDate: "" });
      alert("Assignment created successfully!");
    } catch (err) {
      console.error("Add assignment error:", err);
      alert("Failed to create assignment");
    }
  };

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("Please enter title and content");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/teacher/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
          subjectId: selectedSubject._id,
        }),
      });
      const data = await res.json();
      setNotes([...notes, data]);
      setNewNote({ title: "", content: "" });
      alert("Note uploaded successfully!");
    } catch (err) {
      console.error("Add note error:", err);
      alert("Failed to upload note");
    }
  };

  const addExam = async () => {
    if (!newExam.title.trim() || !newExam.date.trim()) {
      alert("Please enter exam title and date");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/teacher/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newExam.title,
          date: newExam.date,
          time: newExam.time,
          subjectId: selectedSubject._id,
        }),
      });
      const data = await res.json();
      setExams([...exams, data]);
      setNewExam({ title: "", date: "", time: "" });
      alert("Exam created successfully!");
    } catch (err) {
      console.error("Add exam error:", err);
      alert("Failed to create exam");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👩‍🏫 Teacher Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name || "Teacher"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Create Subject Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Create Subject</h2>
          <div className="flex gap-2">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name..."
              className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSubject}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Add Subject
            </button>
          </div>
        </div>

        {/* Subjects List */}
        {subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => setSelectedSubject(subject)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedSubject?._id === subject._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                  {subject.code && <p className="text-sm text-gray-500">{subject.code}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Management Tabs */}
        {selectedSubject && (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 overflow-x-auto border-b border-gray-200">
              {["assignments", "notes", "exams", "attendance"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab === "assignments" && "📝 Assignments"}
                  {tab === "notes" && "📄 Notes"}
                  {tab === "exams" && "🗓️ Exams"}
                  {tab === "attendance" && "📊 Attendance"}
                </button>
              ))}
            </div>

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Assignment</h2>
                  <div className="space-y-3">
                    <input
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      placeholder="Assignment title..."
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      placeholder="Description..."
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    />
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addAssignment}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Create Assignment
                    </button>
                  </div>
                </div>

                {assignments.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignments</h2>
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div key={assignment._id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                          )}
                          {assignment.dueDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Note</h2>
                  <div className="space-y-3">
                    <input
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="Note title..."
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Note content..."
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
                    <button
                      onClick={addNote}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Upload Note
                    </button>
                  </div>
                </div>

                {notes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note._id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-semibold text-gray-800">{note.title}</h3>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Exams Tab */}
            {activeTab === "exams" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Exam</h2>
                  <div className="space-y-3">
                    <input
                      value={newExam.title}
                      onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                      placeholder="Exam title..."
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      value={newExam.time}
                      onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addExam}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Create Exam
                    </button>
                  </div>
                </div>

                {exams.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Exams</h2>
                    <div className="space-y-3">
                      {exams.map((exam) => (
                        <div key={exam._id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            📅 {new Date(exam.date).toLocaleDateString()} {exam.time && `at ${exam.time}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Class Attendance</h2>
                
                {/* Class Code Generator */}
                {selectedSubject && (
                  <div className="mb-6">
                    <ClassCodeGenerator
                      subjectId={selectedSubject._id}
                      subjectName={selectedSubject.name}
                      token={token}
                    />
                  </div>
                )}

                {attendance && (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm">Total Records</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {attendance.statistics.total}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm">Present</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          {attendance.statistics.present}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm">Absent</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                          {attendance.statistics.absent}
                        </p>
                      </div>
                    </div>

                    {/* Attendance Proof Viewer */}
                    {selectedSubject && (
                      <div className="mb-6">
                        <AttendanceProofViewer
                          subjectId={selectedSubject._id}
                          token={token}
                        />
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100 border-b">
                            <th className="p-3 text-left font-semibold">Student</th>
                            <th className="p-3 text-left font-semibold">Email</th>
                            <th className="p-3 text-left font-semibold">Status</th>
                            <th className="p-3 text-left font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.records.slice(0, 10).map((record) => (
                            <tr key={record._id} className="border-b hover:bg-slate-50">
                              <td className="p-3">{record.user?.username}</td>
                              <td className="p-3 text-gray-600">{record.user?.email}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    record.status === "present"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {record.status === "present" ? "✓ Present" : "✗ Absent"}
                                </span>
                              </td>
                              <td className="p-3 text-gray-600">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
