import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      setError("");
      const data = await apiRequest(
        "http://localhost:5000/api/subjects",
        {},
        navigate
      );

      if (!data) {
        return;
      }

      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load subjects");
    }
  };

  const addSubject = async () => {
    if (!name) return;

    const data = await apiRequest(
      "http://localhost:5000/api/subjects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      },
      navigate
    );

    if (!data) return;

    setName("");
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this subject? Attendance data will also be removed."
    );

    if (!confirmDelete) return;

    const data = await apiRequest(
      `http://localhost:5000/api/subjects/${id}`,
      {
        method: "DELETE",
      },
      navigate
    );

    if (!data) return;

    fetchSubjects();
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">📚 My Subjects</h2>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add new subject"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={addSubject}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {subjects.map((sub) => (
          <li
            key={sub._id}
            className="border rounded px-4 py-2 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{sub.name}</p>
              <p className="text-sm text-gray-500">
                Attendance: {sub.attendedClasses}/{sub.totalClasses}
              </p>
            </div>

            <button
              onClick={() => deleteSubject(sub._id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subjects;
