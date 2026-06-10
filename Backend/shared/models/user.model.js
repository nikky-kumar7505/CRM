import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
    type: String,
    enum: [
      "admin",
      "sales_manager",
      "lead_qualifier",
      "sales_closer",
      "video_editor",       // ✅ NEW
      "web_developer",      // ✅ NEW
      "video_shooter",      // ✅ NEW
      "social_media_manager", // ✅ NEW
      "designer",           // ✅ NEW
    ],
    default: "lead_qualifier",
},

    crm_access: {
      type: [String],
      default: ["sales"],
    },

    profile_image: {
      type: String,
      default: "",
    },

    employee_id: {
      type: String,
      unique: true,
      sparse: true,
    },

    department: {
      type: String,
      default: "Sales",
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    managed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    last_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compare password method ──────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;