const DEFAULT_SESSION_MESSAGE = "Session expired. Please login again.";

let unauthorizedHandled = false;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const handleUnauthorized = (message, navigate) => {
  if (!unauthorizedHandled) {
    unauthorizedHandled = true;
    alert(message || DEFAULT_SESSION_MESSAGE);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (typeof navigate === "function") {
    navigate("/login", { replace: true });
  } else {
    window.location.assign("/login");
  }
};

export const apiRequest = async (url, options = {}, navigate) => {
  const token = localStorage.getItem("token");

  if (!token) {
    handleUnauthorized(DEFAULT_SESSION_MESSAGE, navigate);
    return null;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const data = await parseJsonSafe(res);
    handleUnauthorized(data?.message || DEFAULT_SESSION_MESSAGE, navigate);
    return null;
  }

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  unauthorizedHandled = false;
  const data = await parseJsonSafe(res);
  return data ?? {};
};
