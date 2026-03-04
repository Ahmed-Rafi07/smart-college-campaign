import { useEffect, useState } from "react";
import {
  getAttendanceSummary,
  markAttendance,
} from "../services/attendanceService";

const AttendanceSection = ({ subjects }) => {
  const [attendance, setAttendance] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    getAttendanceSummary(token).then(setAttendance);
  }, []);

  const handleMark = async (subjectId, status) => {
    await markAttendance(token, subjectId, status);
    const updated = await getAttendanceSummary(token);
    setAttendance(updated);
  };

  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Mark</th>
          <th>Total</th>
          <th>Present</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((s) => {
          const d = attendance[s._id] || { total: 0, present: 0 };
          return (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>
                <button onClick={() => handleMark(s._id, "present")}>
                  P
                </button>
                <button onClick={() => handleMark(s._id, "absent")}>
                  A
                </button>
              </td>
              <td>{d.total}</td>
              <td>{d.present}</td>
              <td>
                {d.total === 0
                  ? "—"
                  : `${Math.round((d.present / d.total) * 100)}%`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AttendanceSection;
