require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Not Loaded ❌");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "davetechinnovation@gmail.com", // Change this to your recipient email
    subject: "Test Email from Nodemailer",
    text: "This is a test email from the Nodemailer script hi."
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("Email sending failed:", error);
    } else {
        console.log("Email sent successfully:", info.response);
    }
});
