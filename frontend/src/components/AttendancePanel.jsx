import { useEffect, useState } from "react";

const AttendancePanel = ({ token }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH SUBJECTS
  ========================= */
  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await fetch("http://localhost:5000/api/subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSubjects(data);
      setLoading(false);
    };

    fetchSubjects();
  }, [token]);

  /* =========================
     MARK ATTENDANCE
  ========================= */
  const markAttendance = async (subjectId, status) => {
    await fetch("http://localhost:5000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subjectId,
        status,
      }),
    });

    alert(`Marked ${status.toUpperCase()}`);
  };

  if (loading) {
    return <p>Loading subjects...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-4">📅 Attendance</h3>

      {subjects.length === 0 && (
        <p className="text-gray-500">No subjects added yet</p>
      )}

      <div className="space-y-4">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="flex justify-between items-center border rounded-lg p-3"
          >
            <span className="font-medium">{subject.name}</span>

            <div className="flex gap-2">
              <button
                onClick={() => markAttendance(subject._id, "present")}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Present
              </button>

              <button
                onClick={() => markAttendance(subject._id, "absent")}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Absent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendancePanel;
