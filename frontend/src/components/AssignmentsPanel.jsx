import { useEffect, useState } from "react";

const AssignmentsPanel = ({ token }) => {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  // const [assignments, setAssignments] = useState([]);


  /* =========================
     FETCH ASSIGNMENTS
  ========================= */
  const fetchAssignments = async () => {
    try {
      const res = await fetch("https://smart-college-campaign.onrender.com/api/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text(); // prevents JSON crash
        console.error("Assignments fetch failed:", text);
        setAssignments([]);
        return;
      }

      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Assignments fetch error:", err);
      setAssignments([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  /* =========================
     ADD ASSIGNMENT
  ========================= */
  const addAssignment = async () => {
    try {
      if (!title || !dueDate) {
        alert("Please fill in all fields");
        return;
      }

      const res = await fetch("https://smart-college-campaign.onrender.com/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Add failed");
      }

      setTitle("");
      setDueDate("");
      fetchAssignments();
    } catch (err) {
      console.error("Add assignment error:", err);
      alert(err.message || "Failed to add assignment");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-4">📝 Assignments</h3>

      {/* ADD FORM */}
      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assignment title"
          className="border rounded px-3 py-2 flex-1"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <button
          onClick={addAssignment}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <ul className="space-y-2">
        {(assignments || []).map((a) => (
          <li
            key={a._id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>{a.title}</span>
            <span className="text-sm text-gray-500">
              Due: {new Date(a.dueDate).toDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignmentsPanel;
