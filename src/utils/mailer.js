// src/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      to,
      from: `"LMS Pro" <${process.env.EMAIL_USER}>`,
      subject,
      text,
    });
  } catch (error) {
    console.error('Send mail error:', error);
  }
};
