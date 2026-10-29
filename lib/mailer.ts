import nodemailer from "nodemailer";
import nodeHtmlToImage from "node-html-to-image";

// Outgoing mail. With RESEND_API_KEY set, mail goes through Resend (no daily cap worth
// worrying about); otherwise through SMTP, which on Gmail tops out around 500 a day.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  pool: true,
  maxConnections: 3,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as any);

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromName?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

export const mailProvider = () => (process.env.RESEND_API_KEY ? "resend" : "smtp");

function fromAddress(name = "E-Cell BIMTECH") {
  const address = process.env.MAIL_FROM || process.env.SMTP_USER || "ecell@bimtech.ac.in";
  return `"${name}" <${address}>`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendViaResend(mail: OutgoingMail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromAddress(mail.fromName),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

// Sends one email, retrying twice with a short backoff before giving up
export async function sendMail(mail: OutgoingMail) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (mailProvider() === "resend") await sendViaResend(mail);
      else
        await transporter.sendMail({
          from: fromAddress(mail.fromName),
          to: mail.to,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          replyTo: mail.replyTo,
          attachments: mail.attachments,
        });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(800 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Mail delivery failed.");
}

// Sends the same message to many people. Resend takes batches of 100; SMTP goes one by one.
export async function sendBulk(recipients: string[], build: (email: string) => Omit<OutgoingMail, "to">) {
  let sent = 0;
  const failed: string[] = [];
  if (mailProvider() === "resend") {
    for (let i = 0; i < recipients.length; i += 100) {
      const chunk = recipients.slice(i, i + 100);
      try {
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(
            chunk.map((to) => {
              const mail = build(to);
              return { from: fromAddress(mail.fromName), to: [to], subject: mail.subject, html: mail.html, text: mail.text };
            }),
          ),
        });
        if (!res.ok) throw new Error(`Resend batch responded ${res.status}`);
        sent += chunk.length;
      } catch (error) {
        console.error("Bulk batch failed:", error);
        failed.push(...chunk);
      }
    }
  } else {
    for (const to of recipients) {
      try {
        await sendMail({ to, ...build(to) });
        sent++;
      } catch (error) {
        console.error(`Bulk mail to ${to} failed:`, error);
        failed.push(to);
      }
    }
  }
  return { sent, failed };
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

// Plain branded wrapper for notices, login codes and broadcasts. Paragraphs are escaped here.
export function noticeHtml(heading: string, paragraphs: string[], link?: { href: string; label: string }) {
  return `
    <div style="background-color: #000000; color: #ffffff; font-family: -apple-system, Segoe UI, sans-serif; padding: 24px; border: 1px solid #1e3a8a; max-width: 520px; margin: auto; border-radius: 12px;">
      <h2 style="color: #fbbf24; margin-top: 0; font-size: 17px;">${escapeHtml(heading)}</h2>
      ${paragraphs.map((p) => `<p style="font-size: 14px; color: #d4d4d8; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(p)}</p>`).join("")}
      ${link ? `<p><a href="${escapeHtml(link.href)}" style="display: inline-block; background: #ffffff; color: #000000; padding: 10px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">${escapeHtml(link.label)}</a></p>` : ""}
      <div style="margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 12px; font-size: 11px; color: #71717a;">BIMTECH Entrepreneurship Cell</div>
    </div>
  `;
}

interface SendPassEmailProps {
  toEmail: string;
  studentName: string;
  eventTitle: string;
  eventDate: string;
  passId: string;
  // Signed code for the QR; defaults to the bare pass ID
  passCode?: string;
  venue?: string;
}

// 2. Main execution function: Generates image, creates attachment, and sends email.
export async function sendEventPassEmail({
  toEmail,
  studentName,
  eventTitle,
  eventDate,
  passId,
  passCode,
  venue,
}: SendPassEmailProps) {
  
  // Dynamic QR Code generation URL using the attendee's token
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(passCode || passId)}&size=180&margin=1`;

  // --- PASS CARD (IMAGE) VISUAL STRUCTURE ---
  const passCardHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background: #000000; font-family: 'SF Mono', Menlo, monospace; -webkit-font-smoothing: antialiased; }
        .ticket-wrapper { width: 320px; margin: auto; background: #09090b; border: 1px solid #1e3a8a; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); select: none; border-bottom: 2px solid #9333ea; }
        .header { background: #000000; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .header-tag { font-size: 8px; color: #9333ea; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; display: flex; align-items: center; gap: 4px; }
        .event-title { font-size: 14px; color: #ffffff; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qr-section { background: #000000; padding: 24px 0; display: flex; justify-content: center; position: relative; border-bottom: 1px dashed rgba(255,255,255,0.08); }
        .qr-section::before, .qr-section::after { content: ''; position: absolute; top: 50%; width: 12px; height: 12px; background: #000000; border-radius: 50%; transform: translateY(-50%); border: 1px solid rgba(255,255,255,0.1); }
        .qr-section::before { left: -7px; border-right: none; } .qr-section::after { right: -7px; border-left: none; }
        .qr-container { padding: 8px; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.3); }
        .qr-image { width: 130px; height: 130px; display: block; }
        .metadata { padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.01); }
        .meta-field { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .meta-value { font-size: 10px; color: #ffffff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pass-id { font-size: 10px; color: #a1a1aa; text-align: center; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .pass-id-label { font-size: 8px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 2px; }
      </style>
    </head>
    <body>
      <div class="ticket-wrapper">
        <div class="header">
          <div class="header-tag">BIMTECH E-CELL ACCESS</div>
          <div class="event-title">${escapeHtml(eventTitle.toUpperCase())}</div>
        </div>
        <div class="qr-section">
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="Gate Pass QR" class="qr-image" />
          </div>
        </div>
        <div class="metadata">
          <div style="grid-column: span 2;">
            <div class="meta-field">ATTENDEE NAME</div>
            <div class="meta-value">${escapeHtml(studentName)}</div>
          </div>
          <div>
            <div class="meta-field">DATE</div>
            <div class="meta-value">${eventDate}</div>
          </div>
          <div>
            <div class="meta-field">LOCATION</div>
            <div class="meta-value">${escapeHtml(venue || "BIMTECH Campus")}</div>
          </div>
        </div>
        <div class="pass-id">
          <span class="pass-id-label">ENTRY PASS ID</span>
          <strong>${passId}</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  // --- SIMPLIFIED EMAIL BODY ---
  const emailHtml = `
    <div style="background-color: #000000; color: #ffffff; font-family: monospace; padding: 24px; border: 1px solid #1e3a8a; max-width: 500px; margin: auto; border-radius: 12px;">
      <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-top: 0; font-size: 16px;">// SEATS CONFIRMED //</h2>
      
      <p style="font-size: 12px; color: #a1a1aa;">Hi ${escapeHtml(studentName.toUpperCase())},</p>
      
      <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">
        Thanks for registering! Your seat for <strong>${escapeHtml(eventTitle.toUpperCase())}</strong> is locked in.
      </p>
      
      <div style="font-size: 12px; color: #ffffff; font-weight: bold; padding: 12px; background: rgba(147, 51, 234, 0.05); border: 1px solid rgba(147, 51, 234, 0.15); border-radius: 8px; margin: 16px 0;">
        YOUR PASS ID: ${passId}
      </div>
      <!--INLINE_QR-->

      <p style="font-size: 11px; color: #9333ea; font-weight: bold;">
        ⚠️ IMPORTANT GATE INFO:
      </p>
      
      <p style="font-size: 11px; color: #a1a1aa; line-height: 1.5; margin-top: 4px;">
        Your entry pass QR code is included with this email. Save it to your phone and show it at the entry gate so we can scan you in quickly!
      </p>
      
      <div style="margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
        <span style="font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">BIMTECH Entrepreneurship Cell</span>
      </div>
    </div>
  `;

  // A. Render the pass card to a PNG. This needs a headless Chrome, which is not always
  // available on serverless hosts, so a failure here falls back to an inline QR code
  // instead of dropping the whole email.
  let imageBuffer: Buffer | null = null;
  try {
    imageBuffer = await nodeHtmlToImage({
      html: passCardHtml,
      type: "png",
      quality: 100,
      content: { passId, eventTitle, studentName, eventDate },
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }) as Buffer;
  } catch (error) {
    console.error("Pass image render failed, sending inline QR instead:", error);
  }

  const inlineQrHtml = `
    <div style="text-align: center; margin: 16px 0;">
      <img src="${qrCodeUrl}" width="180" height="180" alt="Entry QR code for pass ${passId}" style="background: #ffffff; padding: 8px; border-radius: 12px;" />
    </div>
  `;

  // B. Send the email, with the rendered pass attached when we have it
  await sendMail({
    to: toEmail,
    subject: `[ENTRY PASS] Your ticket for ${eventTitle}`,
    html: imageBuffer ? emailHtml : emailHtml.replace("<!--INLINE_QR-->", inlineQrHtml),
    attachments: imageBuffer
      ? [{ filename: `ecell_pass_${passId.toLowerCase()}.png`, content: imageBuffer, contentType: "image/png" }]
      : [],
  });
  return { success: true };
}

interface ContactMessageProps {
  name: string;
  email: string;
  message: string;
}


// 3. Forwards a message from the home page contact form to the E-Cell inbox.
export async function sendContactMessage({ name, email, message }: ContactMessageProps) {
  const inbox = process.env.CONTACT_INBOX || "ecell@bimtech.ac.in";

  await sendMail({
    fromName: "E-Cell Website",
    to: inbox,
    replyTo: `"${name.replace(/"/g, "")}" <${email}>`,
    subject: `[Website] Message from ${name}`,
    text: `${message}\n\nFrom: ${name} <${email}>`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; font-size: 14px; line-height: 1.6; color: #111;">
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        <p style="color: #666; border-top: 1px solid #eee; padding-top: 12px;">From ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;, sent from the website contact form.</p>
      </div>
    `,
  });
}
