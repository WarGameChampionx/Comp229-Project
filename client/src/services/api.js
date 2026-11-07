
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Send an HTTP request to the Express backend.
 *
 * @param {string} endpoint - Example: "/games"
 * @param {object} options - HTTP method, body and JWT
 * @returns {Promise<any>} Parsed API response
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    token,
    headers = {}
  } = options;

  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: requestHeaders,
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {})
    }
  );

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
