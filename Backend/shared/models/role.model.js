import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    allowedModules: {
      type: [String],
      default: ["daily"],
    },
    landingPath: {
      type: String,
      default: "/daily/dashboard",
      trim: true,
    },
    isManager: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
