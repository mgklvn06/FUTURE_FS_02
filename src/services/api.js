import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getLeads = () => API.get("/leads");

export const createLead = (data) => API.post("/leads", data);

export const updateStatus = (id, status) =>
  API.put(`/leads/${id}/status`, { status });

export const addNote = (id, text) => API.post(`/leads/${id}/notes`, { text });
