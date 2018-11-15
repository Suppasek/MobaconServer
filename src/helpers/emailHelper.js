const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const nodemailerSmtpTransport = require('nodemailer-smtp-transport');

const apiConfig = require('../config/APIConfig');
const mailerConfig = require('../config/MailerConfig');

// METHODS
const readHTMLFile = (filePath, next) => {
  fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
    if (err) {
      next(err);
    } else {
      next(null, html);
    }
  });
};

const smtpTransport = nodemailer.createTransport(nodemailerSmtpTransport(mailerConfig));

const sendVerificationMail = (email, forgetPasswordToken) => {
  readHTMLFile(path.join(__dirname, './templates/verifyAccount.html'), (err, html) => {
    const template = handlebars.compile(html);
    const replacements = {
      host: apiConfig.baseUrl,
      port: apiConfig.httpPort,
      token: forgetPasswordToken,
    };
    const htmlToSend = template(replacements);
    const mailOptions = {
      from: `"Mobacon" <${mailerConfig.auth.user}>`,
      to: email,
      subject: 'Confirm your account',
      html: htmlToSend,
    };
    smtpTransport.sendMail(mailOptions);
  });
};

const sendChangePasswordMail = (email, forgetPasswordToken) => {
  readHTMLFile(path.join(__dirname, './templates/changePassword.html'), (err, html) => {
    const template = handlebars.compile(html);
    const replacements = {
      host: apiConfig.baseUrl,
      port: apiConfig.httpPort,
      token: forgetPasswordToken,
    };
    const htmlToSend = template(replacements);
    const mailOptions = {
      from: `"Mobacon" <${mailerConfig.auth.user}>`,
      to: email,
      subject: 'Change your password',
      html: htmlToSend,
    };
    smtpTransport.sendMail(mailOptions);
  });
};

module.exports = {
  sendVerificationMail,
  sendChangePasswordMail,
};
