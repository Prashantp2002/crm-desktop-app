import axios from "axios";

const BASE = "http://localhost:5000/api";

const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getEmailAccount   = ()            => axios.get(`${BASE}/email/account`, h());
export const getPresets        = (email)       => axios.get(`${BASE}/email/presets?email=${email}`, h());
export const connectEmail      = (data)        => axios.post(`${BASE}/email/connect`, data, h());
export const disconnectAccount = ()            => axios.delete(`${BASE}/email/account/disconnect`, h());
export const getMessages       = (params)      => axios.get(`${BASE}/email/messages`, { ...h(), params });
export const getMessage        = (id)          => axios.get(`${BASE}/email/messages/${id}`, h());
export const sendEmail         = (data)        => axios.post(`${BASE}/email/send`, data, h());
export const starMessage       = (id, starred) => axios.post(`${BASE}/email/messages/${id}/star`, { starred }, h());
export const archiveMessage    = (id)          => axios.post(`${BASE}/email/messages/${id}/archive`, {}, h());
export const markSpam          = (id)          => axios.post(`${BASE}/email/messages/${id}/spam`, {}, h());
export const deleteMessage     = (id)          => axios.delete(`${BASE}/email/messages/${id}`, h());
export const deleteAllSpam     = ()            => axios.delete(`${BASE}/email/spam/delete-all`, h());
export const syncFolder        = (folder)      => axios.post(`${BASE}/email/sync`, { folder }, h());