import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const fetchSubjects = async () => {
    try {
      setError("");
      const data = await apiRequest(
        "/api/subjects",
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
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setLoading(true);
      const data = await apiRequest(
        "/api/subjects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: trimmedName }),
        },
        navigate
      );

      if (!data) return;

      setSubjects((prev) => [...prev, data]);
      setName("");
    } catch (err) {
      setError(err.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this subject? Attendance data will also be removed."
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const data = await apiRequest(
        `/api/subjects/${id}`,
        {
          method: "DELETE",
        },
        navigate
      );

      if (!data) return;

      setSubjects((prev) => prev.filter((sub) => sub._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete subject");
    } finally {
      setDeletingId("");
    }
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubject();
            }
          }}
          placeholder="Add new subject"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={addSubject}
          disabled={loading || !name.trim()}
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add"}
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
              disabled={deletingId === sub._id}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deletingId === sub._id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subjects;
