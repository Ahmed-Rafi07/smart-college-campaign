import { useEffect, useState } from "react";
import {
  getSubjects,
  addSubject,
  deleteSubject,
} from "../services/subjectService";

const SubjectsSection = ({ onSubjectDelete }) => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    getSubjects(token).then(setSubjects);
  }, []);

  const handleAdd = async () => {
    if (!name) return;
    const newSub = await addSubject(token, name);
    setSubjects((prev) => [...prev, newSub]);
    setName("");
  };

  const handleDelete = async (id) => {
    await deleteSubject(token, id);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    onSubjectDelete(id); // 🔥 sync attendance
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Subjects</h3>

      <div className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Subject name"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4">
          Add
        </button>
      </div>

      {subjects.map((s) => (
        <div key={s._id} className="flex justify-between border-b py-2">
          {s.name}
          <button
            onClick={() => handleDelete(s._id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubjectsSection;
