import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAccounts    = ()           => axios.get(`${BASE}/accounts`, authHeaders());
export const createAccount  = (data)       => axios.post(`${BASE}/accounts`, data, authHeaders());
export const updateAccount  = (id, data)   => axios.put(`${BASE}/accounts/${id}`, data, authHeaders());
export const deleteAccount  = (id)         => axios.delete(`${BASE}/accounts/${id}`, authHeaders());