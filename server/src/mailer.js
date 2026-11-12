import nodemailer from 'nodemailer';

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@telangananeuro.com';

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return cachedTransporter;
}

/**
 * Dispatch an email notification to the official TNS address (info@telangananeuro.com)
 * when a new Membership Application is submitted.
 */
export async function sendMembershipNotification(data) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      `[Mailer] SMTP credentials not set. Membership application from "${data.name}" (${data.email}) saved in database.`
    );
    return;
  }

  const from = process.env.SMTP_FROM || `"TNS Website Notification" <${process.env.SMTP_USER}>`;
  const subject = `[TNS Membership Application] ${data.name} — ${data.specialty || 'Member'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #E3DCCF; border-radius: 12px; background-color: #FBF8F1;">
      <div style="border-bottom: 3px solid #393185; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #393185; margin: 0 0 6px 0; font-size: 20px;">New Membership Application</h2>
        <span style="color: #C18C26; font-size: 13px; font-weight: bold; text-transform: uppercase;">Telangana Neurosciences Society</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #292638;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 180px; color: #393185;">Full Name:</td>
          <td style="padding: 8px 0;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Email Address:</td>
          <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #009DE2;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Mobile Number:</td>
          <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #292638;">${data.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Specialty:</td>
          <td style="padding: 8px 0;">${data.specialty}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Membership Category:</td>
          <td style="padding: 8px 0;">${data.category || 'Life Member'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Hospital / Institution:</td>
          <td style="padding: 8px 0;">${data.hospital}</td>
        </tr>
        ${
          data.medicalCouncilNo
            ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #393185;">State / NMC Reg No:</td>
                <td style="padding: 8px 0;">${data.medicalCouncilNo}</td>
              </tr>`
            : ''
        }
        ${
          data.message
            ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #393185; vertical-align: top;">Qualifications & Notes:</td>
                <td style="padding: 8px 0; line-height: 1.5;">${data.message.replace(/\n/g, '<br/>')}</td>
              </tr>`
            : ''
        }
      </table>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E3DCCF; font-size: 12px; color: #666477;">
        <span>This application has been recorded in the TNS Association database. Manage in the <a href="https://www.telangananeuro.com/admin" style="color: #393185; font-weight: bold;">Secretariat Dashboard</a>.</span>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: NOTIFICATION_EMAIL,
      replyTo: data.email,
      subject,
      html,
    });
    console.log(`[Mailer] Membership notification for "${data.name}" dispatched to ${NOTIFICATION_EMAIL}.`);
  } catch (err) {
    console.error('[Mailer] Failed to send membership notification email:', err.message);
  }
}

/**
 * Dispatch an email notification to the official TNS address (info@telangananeuro.com)
 * when a new Contact Enquiry is submitted.
 */
export async function sendContactNotification(data) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      `[Mailer] SMTP credentials not set. Contact enquiry from "${data.name}" (${data.email}) saved in database.`
    );
    return;
  }

  const from = process.env.SMTP_FROM || `"TNS Website Notification" <${process.env.SMTP_USER}>`;
  const subject = `[TNS Website Enquiry] ${data.subject} — ${data.name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #E3DCCF; border-radius: 12px; background-color: #FBF8F1;">
      <div style="border-bottom: 3px solid #393185; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #393185; margin: 0 0 6px 0; font-size: 20px;">New Website Contact Enquiry</h2>
        <span style="color: #C18C26; font-size: 13px; font-weight: bold; text-transform: uppercase;">Telangana Neurosciences Society</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #292638;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #393185;">From:</td>
          <td style="padding: 8px 0;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #009DE2;">${data.email}</a></td>
        </tr>
        ${
          data.phone
            ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #393185;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #292638;">${data.phone}</a></td>
              </tr>`
            : ''
        }
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185;">Subject:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #393185; vertical-align: top;">Message:</td>
          <td style="padding: 8px 0; line-height: 1.5;">${data.message.replace(/\n/g, '<br/>')}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E3DCCF; font-size: 12px; color: #666477;">
        <span>This enquiry has been saved in the TNS Association database. View in the <a href="https://www.telangananeuro.com/admin" style="color: #393185; font-weight: bold;">Secretariat Dashboard</a>.</span>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: NOTIFICATION_EMAIL,
      replyTo: data.email,
      subject,
      html,
    });
    console.log(`[Mailer] Contact notification from "${data.name}" dispatched to ${NOTIFICATION_EMAIL}.`);
  } catch (err) {
    console.error('[Mailer] Failed to send contact notification email:', err.message);
  }
}
