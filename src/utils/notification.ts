import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

const { EMAIL_FROM, MAIL_USERNAME, APP_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
    auth: {
      user: EMAIL_FROM,
      pass: APP_PASS,
    }
});

export const sendMail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from:{
        name:MAIL_USERNAME,
        address:EMAIL_FROM,
    },
    to: to,
    subject: subject,
    html: html,
  });
  return true;
};
