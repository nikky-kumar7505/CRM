import API from "./axios.js";

// Create Deal
export const createDealApi = (data) => API.post("/sales/deals", data);

// Get All Deals
export const getAllDealsApi = (params) =>
  API.get("/sales/deals", { params });

// Get Single Deal
export const getSingleDealApi = (id) => API.get(`/sales/deals/${id}`);

// Update Deal
export const updateDealApi = (id, data) =>
  API.put(`/sales/deals/${id}`, data);

// Delete Deal
export const deleteDealApi = (id) => API.delete(`/sales/deals/${id}`);

// Add Meeting
export const addMeetingApi = (dealId, data) =>
  API.post(`/sales/deals/${dealId}/meetings`, data);

// Update Meeting Outcome
export const updateMeetingApi = (dealId, meetingId, data) =>
  API.put(`/sales/deals/${dealId}/meetings/${meetingId}`, data);

// Get Deal Stats
export const getDealStatsApi = () => API.get("/sales/deals/stats");