const API = "http://localhost:5000/api/attendance";

export const getAttendanceSummary = async (token) => {
  const res = await fetch(`${API}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markAttendance = async (token, subjectId, status) => {
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subjectId, status }),
  });
};
