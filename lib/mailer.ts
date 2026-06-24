import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, 
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

// 2. Define the execution function that handles the dispatch
export async function sendEventPassEmail({
  toEmail,
  studentName,
  eventTitle,
  eventDate,
  passId,
}: SendPassEmailProps) {
  const formattedDate = eventDate.replace(/-/g, "");
  const titleToken = encodeURIComponent(`E-Cell: ${eventTitle}`);
  const descToken = encodeURIComponent(`Your entry pass ID is: ${passId}. Keep your pass card ready at the gate!`);
  const locationToken = encodeURIComponent("BIMTECH Campus, Greater Noida");
  
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleToken}&dates=${formattedDate}/${formattedDate}&details=${descToken}&location=${locationToken}&sf=true&output=xml`;

  // Cyber-styled HTML template layout
  const htmlContent = `
    <div style="background-color: #000000; color: #ffffff; font-family: monospace; padding: 24px; border: 1px solid #1e3a8a; max-width: 500px; margin: auto; border-radius: 12px;">
      <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-top: 0; font-size: 16px;">// BIMTECH E-CELL ACCESS CONFIRMED</h2>
      <p style="font-size: 12px; color: #a1a1aa;">Hello ${studentName.toUpperCase()},</p>
      <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">Your registration token has been verified. Below are your access credentials for the upcoming event forum node:</p>
      
      <div style="background-color: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 12px;">
        <p style="margin: 4px 0;"><span style="color: #71717a;">EVENT:</span> <strong>${eventTitle.toUpperCase()}</strong></p>
        <p style="margin: 4px 0;"><span style="color: #71717a;">DATE:</span> ${eventDate}</p>
        <p style="margin: 4px 0; color: #22c55e;"><strong>PASS ID: ${passId}</strong></p>
      </div>

      <p style="font-size: 11px; color: #71717a; font-style: italic;">// Present this pass ID or your downloaded PNG card at the venue entrance gate.</p>
      
      <div style="margin-top: 20px;">
        <a href="${gCalUrl}" target="_blank" style="background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 8px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; border: 1px solid #38bdf8; display: inline-block;">+ ADD TO GOOGLE CALENDAR</a>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"E-Cell BIMTECH" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[ENTRY PASS CONFIRMED] ${eventTitle}`,
    html: htmlContent,
  });
}