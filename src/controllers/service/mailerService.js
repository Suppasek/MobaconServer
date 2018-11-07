const nodemailer = require('nodemailer');
const mailerConfig = require('../../config/MailerConfig');
const apiConfig = require('../../config/APIConfig');


const sendVerifyMail = (email, confirmationToken) => {
  nodemailer.createTestAccount(() => {
    const transporter = nodemailer.createTransport(mailerConfig);

    const mailOptions = {
      from: `"Mobacon" <${mailerConfig.auth.user}>`,
      to: email,
      subject: 'Confirm your account',
      // text: 'TEST send mail with NodeJS :',
      html: `<a href="${apiConfig.baseUrl}:${apiConfig.port}/confirm?confirmation_token=${confirmationToken}">Confirm your account</a>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(`Send email to ${email}: failed`);
        console.log(error);
      } else {
        console.log(`Send email to ${email}: success`);
      }
    });
  });
};

module.exports = {
  sendVerifyMail,
};
