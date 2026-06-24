import nodemailer from "nodemailer";
import nodeHtmlToImage from "node-html-to-image";

// 1. Initialize SMTP transport configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
  },
} as any);

interface SendPassEmailProps {
  toEmail: string;
  studentName: string;
  eventTitle: string;
  eventDate: string;
  passId: string;
}

// 2. Main execution function: Generates image, creates attachment, and sends email.
export async function sendEventPassEmail({
  toEmail,
  studentName,
  eventTitle,
  eventDate,
  passId,
}: SendPassEmailProps) {
  
  // Dynamic QR Code generation URL using the attendee's token
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(passId)}&size=180&margin=1`;

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
          <div class="event-title">${eventTitle.toUpperCase()}</div>
        </div>
        <div class="qr-section">
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="Gate Pass QR" class="qr-image" />
          </div>
        </div>
        <div class="metadata">
          <div style="grid-column: span 2;">
            <div class="meta-field">ATTENDEE NAME</div>
            <div class="meta-value">${studentName}</div>
          </div>
          <div>
            <div class="meta-field">DATE</div>
            <div class="meta-value">${eventDate}</div>
          </div>
          <div>
            <div class="meta-field">LOCATION</div>
            <div class="meta-value">BIMTECH Campus</div>
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
      
      <p style="font-size: 12px; color: #a1a1aa;">Hi ${studentName.toUpperCase()},</p>
      
      <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">
        Thanks for registering! Your seat for <strong>${eventTitle.toUpperCase()}</strong> is locked in.
      </p>
      
      <div style="font-size: 12px; color: #ffffff; font-weight: bold; padding: 12px; background: rgba(147, 51, 234, 0.05); border: 1px solid rgba(147, 51, 234, 0.15); border-radius: 8px; margin: 16px 0;">
        YOUR PASS ID: ${passId}
      </div>

      <p style="font-size: 11px; color: #9333ea; font-weight: bold;">
        ⚠️ IMPORTANT GATE INFO:
      </p>
      
      <p style="font-size: 11px; color: #a1a1aa; line-height: 1.5; margin-top: 4px;">
        We have attached your official entry pass to this email as a PNG image. Please download it to your phone and show the QR code at the entry gate so we can scan you in quickly!
      </p>
      
      <div style="margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
        <span style="font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">BIMTECH Entrepreneurship Cell</span>
      </div>
    </div>
  `;

  try {
    // A. Create the image buffer from the Pass Card HTML layout
    const imageBuffer = await nodeHtmlToImage({
      html: passCardHtml,
      type: "png",
      quality: 100,
      content: { passId, eventTitle, studentName, eventDate },
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }) as Buffer;

    // B. Send the simplified email copy with the clean image pass attachment
    await transporter.sendMail({
      from: `"E-Cell BIMTECH" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[ENTRY PASS] Your ticket for ${eventTitle}`,
      html: emailHtml,
      attachments: [
        {
          filename: `ecell_pass_${passId.toLowerCase()}.png`,
          content: imageBuffer,
          contentType: "image/png",
        },
      ],
    });

    return { success: true, message: "Simplified entry pass email sent successfully." };

  } catch (error) {
    console.error("Failed to generate or send entry pass:", error);
    throw new Error("Mailer dispatch failure.");
  }
}