import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getTeams   = ()         => axios.get(`${BASE}/teams`, authHeaders());
export const getTeam    = (id)       => axios.get(`${BASE}/teams/${id}`, authHeaders());
export const createTeam = (data)     => axios.post(`${BASE}/teams`, data, authHeaders());
export const updateTeam = (id, data) => axios.put(`${BASE}/teams/${id}`, data, authHeaders());
export const deleteTeam = (id)       => axios.delete(`${BASE}/teams/${id}`, authHeaders());