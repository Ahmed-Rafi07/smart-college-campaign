import { useEffect, useState } from "react";

const AttendanceTimeline = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("https://smart-college-campaign.onrender.com/api/attendance/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6 max-h-[420px] overflow-y-auto">
      <h3 className="font-semibold mb-4">📅 Recent Attendance</h3>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm">No records yet</p>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li
              key={item._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">{item.subject?.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded text-sm ${
                  item.status === "present"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttendanceTimeline;
