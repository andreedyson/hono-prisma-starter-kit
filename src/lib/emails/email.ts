import { Resend } from "resend";
import { env } from "../../configs/env.js";
import type { BaseEmailOptions, EmailTemplate } from "./types.js";
import { resetPasswordTemplate } from "./templates/reset-password.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail<T>({
  to,
  subject,
  template,
  data,
}: BaseEmailOptions<T> & {
  template: EmailTemplate<T>;
}) {
  const { html, text } = template(data);

  return await resend.emails.send({
    from: env.RESEND_FROM,
    to,
    subject,
    html,
    text,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  await sendEmail({
    to: email,
    subject: "Reset your password",
    data: { token },
    template: resetPasswordTemplate,
  });
}
