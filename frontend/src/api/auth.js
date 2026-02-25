import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api/auth"
});

export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);