import axios from "axios";

const BASE = "http://localhost:5000/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});


export const getMyMeetings = async () => {
  const res = await axios.get(`${BASE}/meetings/my`, authHeaders());
  return res.data;
};

export const getMeeting = async (id) => {
  const res = await axios.get(`${BASE}/meetings/${id}`, authHeaders());
  return res.data;
};

export const createMeeting = async (data) => {
  const res = await axios.post(`${BASE}/meetings`, data, authHeaders());
  return res.data;
};

export const updateMeeting = async (id, data) => {
  const res = await axios.put(`${BASE}/meetings/${id}`, data, authHeaders());
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await axios.delete(`${BASE}/meetings/${id}`, authHeaders());
  return res.data;
};