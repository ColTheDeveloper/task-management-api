import transporter from "../config/nodemailer";
import { loadHtmlTemplate } from "./loadHtmlTemplate";

interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  replacements: { [key: string]: string };
}

export const sendEmail = async (options: EmailOptions) => {

  const htmlContent = loadHtmlTemplate(options.templateName, options.replacements);

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};