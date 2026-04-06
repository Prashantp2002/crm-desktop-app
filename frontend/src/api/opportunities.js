import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getOpportunities   = ()         => axios.get(`${BASE}/opportunities`, authHeaders());
export const createOpportunity  = (data)     => axios.post(`${BASE}/opportunities`, data, authHeaders());
export const updateOpportunity  = (id, data) => axios.put(`${BASE}/opportunities/${id}`, data, authHeaders());
export const deleteOpportunity  = (id)       => axios.delete(`${BASE}/opportunities/${id}`, authHeaders());