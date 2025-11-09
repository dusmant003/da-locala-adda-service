const nodemailer = require("nodemailer");

let testAccount;

// Create Ethereal test account at startup
const createTestAccount = async () => {
  testAccount = await nodemailer.createTestAccount();
  console.log("Ethereal account created:", testAccount);
};
createTestAccount();

const transporter = () => {
  if (!testAccount) throw new Error("Test account not created yet!");
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Send email helper
const sendEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter().sendMail({
      from: `"MyApp OTP" <${testAccount.user}>`,
      to,
      subject,
      text,
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = sendEmail;
