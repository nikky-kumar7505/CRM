import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "select",
        "date",
      ],
      required: true,
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

const reportTemplateSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fields: [fieldSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ReportTemplate",
  reportTemplateSchema
);