import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api"
});

export const getDashboardStats = () => API.get("/dashboard/stats");

export const getWeeklyUpdates = () => API.get("/dashboard/updates");

export const getTasks = () => API.get("/tasks");

export const getCases = () => API.get("/cases");