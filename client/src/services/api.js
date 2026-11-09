
import axios from "axios";

// Shared API base URL for Axios and Fetch.
// Relative /api requests are forwarded through Vite's proxy.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

// Axios client used by the Games page.
const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT from the shared session storage.
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Fetch-based API helper used by existing components.
export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    token,
    headers = {},
  } = options;

  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Prefer an explicitly provided token.
  // Otherwise use the authenticated session.
  const authToken =
    token || sessionStorage.getItem("token");

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: requestHeaders,
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" && data !== null
        ? data.message || `HTTP error ${response.status}`
        : `HTTP error ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export default API;
