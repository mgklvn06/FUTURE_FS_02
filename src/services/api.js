import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_STORAGE_KEY = "crm_auth_session";

let authToken = "";

export const API = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token) {
  authToken = token || "";
}

export function storeAuthSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getErrorMessage(error, fallbackMessage = "Something went wrong.") {
  return error?.response?.data?.message || fallbackMessage;
}

API.interceptors.request.use((config) => {
  if (!authToken) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${authToken}`,
    },
  };
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && authToken) {
      clearAuthSession();
      setAuthToken("");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("crm:unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

export const registerUser = (data) => API.post("/auth/register", data);

export const loginUser = (data) => API.post("/auth/login", data);

export const getCurrentUser = () => API.get("/auth/me");

export const getLeads = () => API.get("/leads");

export const createLead = (data) => API.post("/leads", data);

export const updateStatus = (id, status) => API.put(`/leads/${id}/status`, { status });

export const addNote = (id, text) => API.post(`/leads/${id}/notes`, { text });
