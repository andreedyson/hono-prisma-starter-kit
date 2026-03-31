import { env } from "../../../configs/env";
import type { EmailTemplate } from "../types";

interface ResetPasswordData {
  token: string;
}
export const resetPasswordTemplate: EmailTemplate<ResetPasswordData> = ({
  token,
}) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  return {
    html: `
      <h2>Reset your password</h2>
      <p>This link expires in 15 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
    text: `Reset your password: ${resetUrl}`,
  };
};
