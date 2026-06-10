import API from "./axios.js";

export const getRolesApi = (params) => API.get("/roles", { params });
export const createRoleApi = (data) => API.post("/roles", data);
export const updateRoleApi = (roleId, data) => API.put(`/roles/${roleId}`, data);
export const deleteRoleApi = (roleId) => API.delete(`/roles/${roleId}`);
