import API from "./axios.js";

export const getNotificationsApi = () => API.get("/notifications");
export const markAsReadApi = (id) => API.put(`/notifications/${id}/read`);
export const markAllReadApi = () => API.put("/notifications/mark-all-read");