const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = (to, subject, text) => {
  return transporter.sendMail({
    from: `"Smart College" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  });
};
