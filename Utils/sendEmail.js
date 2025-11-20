import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email environment variables missing');
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'IMADEL'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    return info;
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    throw new Error('Email could not be sent: ' + error.message);
  }
};

export default sendEmail;
