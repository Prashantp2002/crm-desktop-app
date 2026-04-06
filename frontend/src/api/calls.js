import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getCalls   = ()         => axios.get(`${BASE}/calls`, authHeaders());
export const getCall    = (id)       => axios.get(`${BASE}/calls/${id}`, authHeaders());
export const createCall = (data)     => axios.post(`${BASE}/calls`, data, authHeaders());
export const updateCall = (id, data) => axios.put(`${BASE}/calls/${id}`, data, authHeaders());
export const deleteCall = (id)       => axios.delete(`${BASE}/calls/${id}`, authHeaders());