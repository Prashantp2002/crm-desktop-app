import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getContacts    = ()         => axios.get(`${BASE}/contacts`, authHeaders());
export const createContact  = (data)     => axios.post(`${BASE}/contacts`, data, authHeaders());
export const updateContact  = (id, data) => axios.put(`${BASE}/contacts/${id}`, data, authHeaders());
export const deleteContact  = (id)       => axios.delete(`${BASE}/contacts/${id}`, authHeaders());
export const getAccounts    = ()         => axios.get(`${BASE}/accounts`, authHeaders());