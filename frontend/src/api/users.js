import axios from "axios";

const BASE = "http://localhost:5000/api";   // ← /api not /api/auth

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getUsers   = ()         => axios.get(`${BASE}/users`, authHeaders());
export const getUser    = (id)       => axios.get(`${BASE}/users/${id}`, authHeaders());
export const createUser = (data)     => axios.post(`${BASE}/users`, data, authHeaders());
export const updateUser = (id, data) => axios.put(`${BASE}/users/${id}`, data, authHeaders());
export const deleteUser = (id)       => axios.delete(`${BASE}/users/${id}`, authHeaders());