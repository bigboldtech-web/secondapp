interface EmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SmsInput {
  to: string;
  message: string;
}

type DeliveryResult = { ok: true; provider: string } | { ok: false; error: string };

function emailProvider(): "resend" | "console" {
  return process.env.RESEND_API_KEY ? "resend" : "console";
}

export async function sendEmail(input: EmailInput): Promise<DeliveryResult> {
  if (emailProvider() === "console") {
    console.log(`[email:console] to=${input.to} subject="${input.subject}"\n${input.text}`);
    return { ok: true, provider: "console" };
  }

  const from = process.env.EMAIL_FROM || "Second App <noreply@gosecond.in>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<pre style="font-family:system-ui">${escapeHtml(input.text)}</pre>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[email:resend] failed: ${res.status} ${text}`);
    return { ok: false, error: `Resend ${res.status}` };
  }
  return { ok: true, provider: "resend" };
}

function smsProvider(): "msg91" | "console" {
  return process.env.MSG91_AUTH_KEY ? "msg91" : "console";
}

function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export async function sendSms(input: SmsInput): Promise<DeliveryResult> {
  if (smsProvider() === "console") {
    console.log(`[sms:console] to=${input.to}\n${input.message}`);
    return { ok: true, provider: "console" };
  }

  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || "SECAPP";
  if (!templateId) {
    console.error("[sms:msg91] MSG91_TEMPLATE_ID not set");
    return { ok: false, error: "MSG91 template not configured" };
  }

  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: process.env.MSG91_AUTH_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      sender: senderId,
      short_url: "0",
      recipients: [
        {
          mobiles: normalizeIndianPhone(input.to),
          message: input.message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[sms:msg91] failed: ${res.status} ${text}`);
    return { ok: false, error: `MSG91 ${res.status}` };
  }
  return { ok: true, provider: "msg91" };
}

export function generateOtp(): string {
  if (process.env.DEV_OTP) return process.env.DEV_OTP;
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isDevOtpMode(): boolean {
  return smsProvider() === "console";
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}
