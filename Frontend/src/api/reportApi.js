import API from "./axios.js";

export const getMyTemplateApi = () => API.get("/daily/template");
export const createSlotOneApi = (data) => API.post("/daily/slot-one", data);
export const createSlotTwoApi = (data) => API.post("/daily/slot-two", data);
export const getMyReportsApi = () => API.get("/daily/my-reports");
export const getMyReportByDateApi = (date) => API.get(`/daily/my-reports/${date}`);
export const getTeamReportsApi = () => API.get("/daily/team");
export const getReportByIdApi = (reportId) => API.get(`/daily/report/${reportId}`);
export const reviewReportApi = (reportId, data) =>
  API.patch(`/daily/report/${reportId}/review`, data);

export const getTemplatesApi = () => API.get("/template");
export const getTemplateByRoleApi = (role) => API.get(`/template/${role}`);
export const createTemplateApi = (data) => API.post("/template", data);
export const updateTemplateApi = (templateId, data) =>
  API.put(`/template/${templateId}`, data);
export const deleteTemplateApi = (templateId) =>
  API.delete(`/template/${templateId}`);

export const getWeeklyPerformanceApi = () => API.get("/daily/performance/weekly");
export const getMonthlyPerformanceApi = () => API.get("/daily/performance/monthly");
export const getTeamPerformanceApi = () => API.get("/daily/team/performance");
