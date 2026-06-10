import ReportTemplate from "../models/reportTemplate.model.js";

export const createTemplate = async (req, res) => {
  try {
    const { role, fields } = req.body;

    const exists = await ReportTemplate.findOne({
      role,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Template already exists for this role",
      });
    }

    const template = await ReportTemplate.create({
      role,
      fields,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates =
      await ReportTemplate.find().sort({
        role: 1,
      });

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTemplateByRole = async (
  req,
  res
) => {
  try {
    const template =
      await ReportTemplate.findOne({
        role: req.params.role,
      });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTemplate = async (
  req,
  res
) => {
  try {
    const template =
      await ReportTemplate.findByIdAndUpdate(
        req.params.templateId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTemplate = async (
  req,
  res
) => {
  try {
    const template =
      await ReportTemplate.findByIdAndDelete(
        req.params.templateId
      );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Template deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};