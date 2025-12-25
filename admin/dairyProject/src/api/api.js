
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Something went wrong");
  }

  if (json.data) {
    return json.data;
  }

  return json;
}
