const API = "http://localhost:5000/api/subjects";

export const getSubjects = async (token) => {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const addSubject = async (token, name) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const deleteSubject = async (token, id) => {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};
