const API_BASE = "http://127.0.0.1:8000/api";

export async function createShare(payload) {
  const res = await fetch(`${API_BASE}/shares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to create secret");
  }

  return data;
}

export async function getShare(id) {
  const res = await fetch(`${API_BASE}/shares/${id}`);

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Secret not found or expired");
  }

  return data;
}

export async function registerFailedAttempt(id) {
  const res = await fetch(`${API_BASE}/shares/${id}/attempt`, {
    method: "POST",
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to record attempt");
  }

  return data;
}

export async function consumeShare(id) {
  const res = await fetch(`${API_BASE}/shares/${id}/consume`, {
    method: "POST",
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to destroy secret");
  }

  return data;
}