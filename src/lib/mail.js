const nodemailer = require("nodemailer");

const [user, pass, to] = process.argv.slice(3);

const sendMail = async (data) => {
  let transporter = nodemailer.createTransport({
    service: "qq",
    host: "smtp.qq.com",
    port: "465",
    secureConnection: true,
    auth: {
      user: user,
      pass: pass,
    },
  });

  await transporter.sendMail({
    from: `"JueJin" <${user}>`,
    to: to,
    subject: "JueJin自动脚本",
    html: data,
  });
};

module.exports = sendMail;
