import API from "./axios.js";

export const createLeadApi = (data) => API.post("/sales/leads", data);
export const createLeadCSVApi = (formData) =>
  API.post("/sales/leads/csv-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAllLeadsApi = (params) =>
  API.get("/sales/leads", { params });
export const getSingleLeadApi = (id) => API.get(`/sales/leads/${id}`);
export const updateLeadApi = (id, data) =>
  API.put(`/sales/leads/${id}`, data);
export const deleteLeadApi = (id) => API.delete(`/sales/leads/${id}`);
export const assignLeadApi = (id, data) =>
  API.put(`/sales/leads/${id}/assign`, data);
export const addCallLogApi = (id, data) =>
  API.post(`/sales/leads/${id}/call-log`, data);
export const passToCloserApi = (id) =>
  API.put(`/sales/leads/${id}/pass-to-closer`);
export const getLeadStatsApi = () => API.get("/sales/leads/stats");

// ✅ Bulk status update for lead qualifier
export const bulkUpdateLeadsApi = (data) =>
  API.put("/sales/leads/bulk-update", data);