import { useState } from "react";
import {
  createTemplateApi,
  deleteTemplateApi,
  getTemplateByRoleApi,
  getTemplatesApi,
  updateTemplateApi,
} from "../api/reportApi.js";

export const useTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTemplate = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await createTemplateApi(payload);

      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTemplates = async () => {
    try {
      setLoading(true);

      const { data } = await getTemplatesApi();

      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to fetch templates"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTemplateByRole = async (role) => {
    try {
      setLoading(true);

      const { data } = await getTemplateByRoleApi(role);

      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to fetch template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (
    templateId,
    payload
  ) => {
    try {
      setLoading(true);

      const { data } = await updateTemplateApi(templateId, payload);

      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (
    templateId
  ) => {
    try {
      setLoading(true);

      const { data } = await deleteTemplateApi(templateId);

      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createTemplate,
    getTemplates,
    getTemplateByRole,
    updateTemplate,
    deleteTemplate,
  };
};
