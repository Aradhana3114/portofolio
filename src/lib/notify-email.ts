import "server-only";
import nodemailer from "nodemailer";

type DesignEmailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  origin?: string;
};

const INK = "#1A1612";
const CREAM = "#FDF6E3";
const CREAM_SOFT = "#FFEED3";
const YELLOW = "#FFD43B";
const PINK = "#FF6B9D";
const GREEN = "#4ADE80";
const PURPLE = "#A78BFA";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function fieldRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:0 0 14px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.18em;color:#8A8175;">
        ${label}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 18px 0;font-size:17px;line-height:24px;font-weight:900;color:${INK};">
        ${valueHtml}
      </td>
    </tr>`;
}

function buildHtml(input: DesignEmailInput, origin: string | undefined): string {
  const name = escapeHtml(singleLine(input.name));
  const senderEmail = escapeHtml(singleLine(input.email));
  const subjectLabel = escapeHtml(singleLine(input.subject));
  const messageHtml = escapeHtml(input.message).replace(/\r\n|\n|\r/g, "<br>");
  const sentAt = `${new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  })} WIB`;
  const meta = origin ? `${sentAt} · ${escapeHtml(origin)}` : sentAt;

  return `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:0;background-color:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
          <tr>
            <td style="padding:0 0 16px 0;">
              <span style="display:inline-block;background-color:${YELLOW};border:3px solid ${INK};border-radius:6px;padding:6px 14px;font-size:12px;line-height:16px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:${INK};">&#10022; Pesan Baru!</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 20px 0;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:32px;line-height:34px;font-weight:900;text-transform:uppercase;color:${INK};letter-spacing:-0.02em;">
              Kontak<br>
              <span style="display:inline-block;background-color:${PINK};border:3px solid ${INK};border-radius:6px;padding:0 10px;margin-top:6px;">Portfolio</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#FFFFFF;border:3px solid ${INK};border-radius:6px;box-shadow:6px 6px 0 0 ${INK};padding:24px 22px 6px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${fieldRow("Nama", name)}
                ${fieldRow(
                  "Email",
                  `<a href="mailto:${senderEmail}" style="color:#1D4ED8;text-decoration:underline;font-weight:900;">${senderEmail}</a>`
                )}
                ${fieldRow(
                  "Jenis Proyek",
                  `<span style="display:inline-block;background-color:${GREEN};border:2px solid ${INK};border-radius:999px;padding:4px 14px;font-size:12px;line-height:16px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:${INK};">${subjectLabel}</span>`
                )}
                <tr>
                  <td style="padding:0 0 10px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.18em;color:#8A8175;">
                    Pesan
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px 0;">
                    <div style="background-color:${CREAM_SOFT};border:2px solid ${INK};border-radius:4px;padding:14px 16px;font-size:15px;line-height:25px;color:${INK};">
                      ${messageHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 0 0 0;">
              <div style="background-color:${PURPLE};border:3px solid ${INK};border-radius:6px;padding:12px 16px;font-size:13px;line-height:20px;font-weight:700;color:${INK};">
                &#8627; Balas email ini untuk membalas langsung ke <b>${senderEmail}</b>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0 0 0;font-size:11px;line-height:16px;color:#8A8175;text-align:center;">
              ${meta}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(input: DesignEmailInput): string {
  return [
    "PESAN BARU DARI FORMULIR KONTAK PORTOFOLIO",
    "",
    `Nama: ${singleLine(input.name)}`,
    `Email: ${singleLine(input.email)}`,
    `Jenis Proyek: ${singleLine(input.subject)}`,
    "",
    "Pesan:",
    input.message,
    "",
    "Balas email ini untuk membalas langsung ke pengirim.",
  ].join("\n");
}

export async function sendDesignEmail(input: DesignEmailInput): Promise<void> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) {
    console.log("[contact] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping designed email (Formspree still delivers).");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });

  await transporter.sendMail({
    from: `"Portofolio Aradhana" <${user}>`,
    to: user,
    replyTo: `"${singleLine(input.name)}" <${singleLine(input.email)}>`,
    subject: singleLine(`[Portofolio] ${input.subject} — dari ${input.name}`),
    text: buildText(input),
    html: buildHtml(input, input.origin),
  });
}
