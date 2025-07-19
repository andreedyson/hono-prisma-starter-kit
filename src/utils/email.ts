import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM } from "../configs/constants.js";

const resend = new Resend(RESEND_API_KEY);

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  await resend.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
  return;
};
