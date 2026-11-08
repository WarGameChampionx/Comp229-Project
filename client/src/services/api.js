

import axios from "axios";

// Axios API client used by the Games page and other components.
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "/api",
});

// Automatically attach the saved authentication token.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Fetch-based API helper used by the remote frontend code.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

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

  const authToken = token || localStorage.getItem("token");

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      data?.message || `HTTP error ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export default API;
