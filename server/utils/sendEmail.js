const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Workout & Meal Planner" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your email address",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>Thanks for signing up! Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
};

module.exports = { sendVerificationEmail };
