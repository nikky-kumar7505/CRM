import API from "./axios.js";

// Login
export const loginApi = (data) => API.post("/auth/login", data);

// Get My Profile
export const getMeApi = () => API.get("/auth/me");

// Change Password
export const changePasswordApi = (data) =>
  API.put("/auth/change-password", data);

// Register User (Admin only)
export const registerUserApi = (data) => API.post("/auth/register", data);

// Get All Users
export const getAllUsersApi = (params) => API.get("/auth/users", { params });

// Update User
export const updateUserApi = (id, data) => API.put(`/auth/users/${id}`, data);

// Delete User
export const deleteUserApi = (id) => API.delete(`/auth/users/${id}`);

export const adminChangePasswordApi = (id, data) =>
  API.put(`/auth/users/${id}/change-password`, data);