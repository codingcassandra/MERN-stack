// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter (this example uses Gmail, but works with SendGrid, etc.)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `NutriTrack App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // You can also add HTML formatting later if you want a fancy email
    // html: options.html, 
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
