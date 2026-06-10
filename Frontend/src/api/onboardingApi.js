import API from "./axios.js";

export const createOnboardingApi = (data) =>
  API.post("/sales/onboarding", data);

export const getAllOnboardingsApi = (params) =>
  API.get("/sales/onboarding", { params });

export const getSingleOnboardingApi = (id) =>
  API.get(`/sales/onboarding/${id}`);

export const updateOnboardingApi = (id, data) =>
  API.put(`/sales/onboarding/${id}`, data);

export const assignTeamMemberApi = (id, data) =>
  API.put(`/sales/onboarding/${id}/assign`, data);

export const deleteOnboardingApi = (id) =>
  API.delete(`/sales/onboarding/${id}`);

export const generateCredentialLinkApi = (id) =>
  API.post(`/sales/onboarding/${id}/generate-credential-link`);

export const getOnboardingByTokenApi = (token) =>
  API.get(`/sales/onboarding/public/${token}`);

export const submitCredentialsApi = (token, data) =>
  API.post(`/sales/onboarding/public/${token}/submit`, data);