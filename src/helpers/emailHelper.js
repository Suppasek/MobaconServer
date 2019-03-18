const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const handlebars = require('handlebars');

const apiConfig = require('../config/APIConfig');
const mailerConfig = require('../config/MailerConfig');

sgMail.setApiKey(mailerConfig.key);

const readHTMLFile = (filePath, next) => {
  fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
    if (err) {
      next(err);
    } else {
      next(null, html);
    }
  });
};
const sendVerificationMail = (email, forgetPasswordToken) => {
  readHTMLFile(path.join(__dirname, './templates/verifyAccount.html'), (err, html) => {
    const template = handlebars.compile(html);
    const htmlToSend = template({
      protocol: apiConfig.web.protocol,
      host: apiConfig.web.host,
      port: apiConfig.web.port,
      token: forgetPasswordToken,
    });
    const mailOptions = {
      to: email,
      from: 'Mobacon@mobacon.com',
      subject: 'Confirm your account',
      html: htmlToSend,
    };
    sgMail.send(mailOptions);
  });
};
const sendChangePasswordMail = (email, forgetPasswordToken) => {
  readHTMLFile(path.join(__dirname, './templates/changePassword.html'), (err, html) => {
    const template = handlebars.compile(html);
    const htmlToSend = template({
      protocol: apiConfig.web.protocol,
      host: apiConfig.web.host,
      port: apiConfig.web.port,
      token: forgetPasswordToken,
    });
    const mailOptions = {
      from: 'Mobacon@mobacon.com',
      to: email,
      subject: 'Change your password',
      html: htmlToSend,
    };
    sgMail.send(mailOptions);
  });
};

module.exports = {
  sendVerificationMail,
  sendChangePasswordMail,
};
