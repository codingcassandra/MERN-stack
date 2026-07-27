const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/sendEmail");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
    });

    await sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before logging in" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal whether an account exists for this email.
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists for that email, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "This account is already verified. You can log in." });
    }

    user.verificationToken = randomUUID();
    await user.save();

    await sendVerificationEmail(user, user.verificationToken);

    res.json({ success: true, message: "Verification email sent." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const logout = (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

module.exports = { register, login, verifyEmail, resendVerification, googleCallback, getMe, logout };
