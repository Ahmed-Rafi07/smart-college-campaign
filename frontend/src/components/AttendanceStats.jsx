import { useEffect, useState } from "react";

const AttendanceStats = ({ subjectId, token }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(
        `http://localhost:5000/api/attendance/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, [subjectId, token]);

  if (!stats) return null;

  return (
    <div className="bg-slate-100 p-4 rounded-lg mt-2">
      <p>Total Classes: {stats.total}</p>
      <p>Present: {stats.present}</p>
      <p>Absent: {stats.absent}</p>
      <p className="font-semibold">
        Attendance %: {stats.percentage}%
      </p>
    </div>
  );
};

export default AttendanceStats;
