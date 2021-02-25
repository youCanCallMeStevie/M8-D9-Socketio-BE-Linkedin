const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })
);
const sendEmail = async (user) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email, // list of receivers
      subject: "Welcome to Linkedin Clone", // Subject line
      text: `Hi ${user.firstName} thank you for registering`, // plain text body
      html: `<b>Hi ${user.firstName} thank you for registering</b>`, // html body
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports = sendEmail;
