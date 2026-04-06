import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getTasks   = ()         => axios.get(`${BASE}/tasks`, authHeaders());
export const getTask    = (id)       => axios.get(`${BASE}/tasks/${id}`, authHeaders());
export const createTask = (data)     => axios.post(`${BASE}/tasks`, data, authHeaders());
export const updateTask = (id, data) => axios.put(`${BASE}/tasks/${id}`, data, authHeaders());
export const deleteTask = (id)       => axios.delete(`${BASE}/tasks/${id}`, authHeaders());