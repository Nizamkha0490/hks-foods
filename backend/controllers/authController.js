import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendOTPEmail, logOTPToConsole } from "../utils/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, and password",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { username }],
  });

  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: "Admin with this email or username already exists",
    });
  }

  const admin = await Admin.create({
    username,
    email,
    password,
    role: "admin",
  });

  const token = generateToken(admin._id);

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordCorrect = await admin.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Admin account is inactive",
    });
  }

  const token = generateToken(admin._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const admin = await Admin.findById(req.admin._id);

  res.status(200).json({
    success: true,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  const isPasswordCorrect = await admin.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent.",
    });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  admin.resetOTP = otp;
  admin.resetOTPExpiry = otpExpiry;
  if (!admin.userId) {
    admin.userId = admin._id;
  }

  try {
    await admin.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendOTPEmail(email, otp);
    } else {
      logOTPToConsole(email, otp);
    }

    res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Error saving admin in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, OTP has been sent",
    });
  }

  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    admin.resetOTP = otp;
    admin.resetOTPExpiry = otpExpiry;
    await admin.save();

    let emailSent = false;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      emailSent = await sendOTPEmail(email, otp);
    }

    if (emailSent) {
    } else {
      logOTPToConsole(email, otp);
    }

    res.status(200).json({
      success: true,
      message: "OTP has been resent",
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and OTP",
    });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Invalid OTP or email",
    });
  }

  if (!admin.resetOTP || admin.resetOTP !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  if (!admin.resetOTPExpiry || new Date() > admin.resetOTPExpiry) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired",
    });
  }

  const resetToken = jwt.sign(
    {
      id: admin._id,
      purpose: "password_reset",
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  admin.resetOTP = null;
  admin.resetOTPExpiry = null;
  admin.resetToken = resetToken;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token: resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password, token } = req.body;

  if (!email || !password || !token) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password, and token",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Invalid reset token",
    });
  }

  if (admin.resetToken !== token) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid token purpose",
      });
    }

    admin.password = password;
    admin.resetOTP = null;
    admin.resetOTPExpiry = null;
    admin.resetToken = null;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
});
