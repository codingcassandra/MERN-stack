const express = require("express");
const passport = require("passport");
const {
  register,
  login,
  verifyEmail,
  googleCallback,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.get("/me", protect, getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google-auth-failed`,
  }),
  googleCallback
);

module.exports = router;
