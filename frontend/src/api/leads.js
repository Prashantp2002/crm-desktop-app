import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getLeads    = ()         => axios.get(`${BASE}/leads`, authHeaders());
export const createLead  = (data)     => axios.post(`${BASE}/leads`, data, authHeaders());
export const updateLead  = (id, data) => axios.put(`${BASE}/leads/${id}`, data, authHeaders());
export const deleteLead  = (id)       => axios.delete(`${BASE}/leads/${id}`, authHeaders());