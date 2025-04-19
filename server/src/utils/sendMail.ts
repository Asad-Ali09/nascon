import nodemailer from "nodemailer";
import { googleCredentials } from "../config";
import customError from "./customError";

interface SendMailOptions {
  subject: string;
  message: string;
  send_to: string;
  sent_from?: string;
  reply_to?: string;
}

export const sendMail = async ({
  subject,
  message,
  send_to,
  sent_from,
  reply_to,
}: SendMailOptions): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleCredentials.username,
      pass: googleCredentials.password,
    },
  });

  const mailOptions = {
    from: sent_from || "XYZ Support Team",
    to: send_to,
    subject,
    html: message,
    replyTo: reply_to,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    throw new customError(500, (err as Error).message || "Error sending mail");
  }
};


