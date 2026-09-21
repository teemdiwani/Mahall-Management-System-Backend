"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("./logger.js");
class MailService {
    transporter = null;
    isConfigured = false;
    constructor() {
        this.initTransporter();
    }
    initTransporter() {
        if (env_js_1.env.SMTP_HOST && env_js_1.env.SMTP_USER) {
            try {
                this.transporter = nodemailer_1.default.createTransport({
                    host: env_js_1.env.SMTP_HOST,
                    port: env_js_1.env.SMTP_PORT,
                    secure: env_js_1.env.SMTP_SECURE,
                    auth: {
                        user: env_js_1.env.SMTP_USER,
                        pass: env_js_1.env.SMTP_PASS,
                    },
                });
                this.isConfigured = true;
                logger_js_1.logger.info(`📧 Nodemailer configured with SMTP host: ${env_js_1.env.SMTP_HOST}:${env_js_1.env.SMTP_PORT}`);
            }
            catch (err) {
                logger_js_1.logger.error({ err }, '❌ Failed to initialize Nodemailer SMTP transporter');
                this.isConfigured = false;
            }
        }
        else {
            logger_js_1.logger.warn('⚠️ SMTP_HOST / SMTP_USER not set. Nodemailer will simulate email dispatch in development mode.');
            this.isConfigured = false;
        }
    }
    /**
     * Send Hajj/Umrah registration confirmation email to applicant
     * notifying them to contact the travel agency to grab their seats.
     */
    async sendHajjRegistrationConfirmationEmail(data) {
        const formattedDate = data.departureDate
            ? new Date(data.departureDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            })
            : 'TBA';
        const subject = `🕌 Your ${data.type} Registration is Successful — Contact ${data.travelsName} (${data.contactPhone}) to Grab Your Seats [Ref: ${data.registrationRef}]`;
        const textContent = `Assalamu Alaikum ${data.applicantName},

Your registration for "${data.postTitle}" has been received successfully!

REGISTRATION SUMMARY:
- Reference ID: ${data.registrationRef}
- Type: ${data.type}
- Seats Reserved: ${data.seats}
- Departure: ${formattedDate}
${data.estimatedPrice ? `- Estimated Cost: ${data.estimatedPrice}` : ''}

=======================================================
ACTION REQUIRED: GRAB YOUR SEATS NOW
=======================================================
Slots are limited and allocated on a first-come, first-served basis.
Please contact the travel agency directly to confirm documents and secure your seats:

Travel Agency: ${data.travelsName}
${data.contactPerson ? `Contact Person: ${data.contactPerson}\n` : ''}Phone / WhatsApp: ${data.contactPhone}
${data.contactEmail ? `Email: ${data.contactEmail}\n` : ''}
Quote your Reference ID (${data.registrationRef}) when speaking with the travels representative.

May Allah grant you an accepted and blessed pilgrimage.

Warm regards,
Mahallu Management Committee Office
`;
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #064e3b, #047857); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; color: #a7f3d0; }
    .body { padding: 32px 24px; }
    .greeting { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #334155; }
    .cta-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .cta-title { color: #15803d; font-size: 17px; font-weight: 700; margin-top: 0; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .cta-desc { font-size: 14px; color: #166534; line-height: 1.5; margin-bottom: 16px; }
    .travel-card { background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #bbf7d0; }
    .travel-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .travel-label { color: #64748b; font-weight: 500; }
    .travel-value { color: #0f172a; font-weight: 700; text-align: right; }
    .phone-btn { display: inline-block; background: #15803d; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 12px; text-align: center; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
    .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .details-table td.label { color: #64748b; width: 40%; font-weight: 500; }
    .details-table td.val { color: #0f172a; font-weight: 600; text-align: right; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ecfdf5; color: #047857; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 36px; margin-bottom: 8px;">🕋</div>
      <h1>Mahallu Management Portal</h1>
      <p>Hajj &amp; Umrah Travel Registration Desk</p>
    </div>

    <div class="body">
      <p class="greeting">
        <strong>Assalamu Alaikum wa Rahmatullahi wa Barakatuh, ${data.applicantName}</strong>,<br><br>
        Alhamdulillah, your registration for <strong>${data.postTitle}</strong> has been received and verified by the Mahallu administration.
      </p>

      <!-- Prominent Travels Contact & Grab Seat Alert -->
      <div class="cta-box">
        <div class="cta-title">
          <span>⚡</span> Action Required: Contact Travel Partner to Grab Your Seats
        </div>
        <p class="cta-desc">
          Available slots are limited and prioritized on a first-come, first-served basis. Please reach out to the authorized travel agency immediately to submit documents and secure your booking:
        </p>

        <div class="travel-card">
          <div class="travel-row">
            <span class="travel-label">Travel Agency:</span>
            <span class="travel-value">${data.travelsName}</span>
          </div>
          ${data.contactPerson
            ? `<div class="travel-row">
                  <span class="travel-label">Travels Officer:</span>
                  <span class="travel-value">${data.contactPerson}</span>
                </div>`
            : ''}
          <div class="travel-row">
            <span class="travel-label">Phone / WhatsApp:</span>
            <span class="travel-value" style="color: #15803d; font-size: 16px;">${data.contactPhone}</span>
          </div>
          ${data.contactEmail
            ? `<div class="travel-row">
                  <span class="travel-label">Email:</span>
                  <span class="travel-value">${data.contactEmail}</span>
                </div>`
            : ''}
          <div class="travel-row" style="margin-bottom: 0;">
            <span class="travel-label">Your Booking Ref:</span>
            <span class="travel-value" style="font-family: monospace; color: #047857;">${data.registrationRef}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 16px;">
          <a href="tel:${data.contactPhone.replace(/\s+/g, '')}" class="phone-btn">
            📞 Call ${data.contactPhone} to Confirm
          </a>
        </div>
      </div>

      <!-- Registration Summary -->
      <h4 style="margin: 20px 0 8px 0; font-size: 15px; color: #0f172a;">Registration Details</h4>
      <table class="details-table">
        <tr>
          <td class="label">Package:</td>
          <td class="val">${data.postTitle}</td>
        </tr>
        <tr>
          <td class="label">Category:</td>
          <td class="val"><span class="badge">${data.type}</span></td>
        </tr>
        <tr>
          <td class="label">Seats Reserved:</td>
          <td class="val"><strong>${data.seats}</strong> ${data.seats === 1 ? 'person' : 'persons'}</td>
        </tr>
        <tr>
          <td class="label">Expected Departure:</td>
          <td class="val">${formattedDate}</td>
        </tr>
        ${data.estimatedPrice
            ? `<tr>
                <td class="label">Approx. Package Cost:</td>
                <td class="val">${data.estimatedPrice}</td>
              </tr>`
            : ''}
      </table>

      <p style="margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.5;">
        <em>Note: When contacting the travel agency, please quote your registration reference number <strong>${data.registrationRef}</strong> for swift verification under our Mahall quota.</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>Mahallu Islamic Community Center</strong></p>
      <p>General Secretary &amp; Pilgrimage Coordination Committee</p>
      <p style="font-size: 11px; margin-top: 8px; color: #94a3b8;">This automated email was sent via Nodemailer for your Hajj &amp; Umrah slot registration.</p>
    </div>
  </div>
</body>
</html>
`;
        if (this.isConfigured && this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from: env_js_1.env.SMTP_FROM,
                    to: data.applicantEmail,
                    subject,
                    text: textContent,
                    html: htmlContent,
                });
                logger_js_1.logger.info({ messageId: info.messageId, recipient: data.applicantEmail }, '✅ Hajj/Umrah confirmation email dispatched successfully via Nodemailer');
                return { success: true, messageId: info.messageId, simulated: false };
            }
            catch (error) {
                logger_js_1.logger.error({ error }, '❌ Error sending email via Nodemailer');
                return { success: false, simulated: false };
            }
        }
        else {
            // In development or when SMTP is not configured, log full details cleanly
            logger_js_1.logger.info(`\n=======================================================\n` +
                `[SIMULATED NODEMAILER DISPATCH]\n` +
                `To: ${data.applicantEmail}\n` +
                `Subject: ${subject}\n` +
                `Message: Contact ${data.travelsName} at ${data.contactPhone} to grab ${data.seats} seat(s). Ref: ${data.registrationRef}\n` +
                `=======================================================\n`);
            return { success: true, simulated: true };
        }
    }
}
exports.mailService = new MailService();
