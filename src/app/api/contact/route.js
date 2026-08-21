import nodemailer from 'nodemailer';

/* ── SMTP Transporter ── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ── User Thank You Email ── */
function userEmailHTML({ name, service, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You – Codeverza</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:20px;overflow:hidden;border:1px solid rgba(177,76,255,0.25);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0030,#2d0050,#1a0030);padding:40px 40px 30px;text-align:center;border-bottom:1px solid rgba(177,76,255,0.3);">
              <img src="https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png" alt="Codeverza" width="120" height="120"
                style="margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;border-radius:12px;" />
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
                Code<span style="color:#b14cff;">verza</span>
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">Software House</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;">
                Thank you, ${name}! 🎉
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#ccc;line-height:1.7;">
                We've received your message and we're excited to connect with you. Our team will review your inquiry and get back to you within <strong style="color:#e0aaff;">24 hours</strong>.
              </p>

              <!-- Summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(177,76,255,0.08);border:1px solid rgba(177,76,255,0.2);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#b14cff;letter-spacing:2px;text-transform:uppercase;">Your Submission Summary</p>
                    ${service ? `<p style="margin:0 0 8px;font-size:14px;color:#ddd;"><span style="color:#999;">Service:</span> <strong style="color:#e0aaff;">${service}</strong></p>` : ''}
                    <p style="margin:0;font-size:14px;color:#ddd;line-height:1.7;"><span style="color:#999;">Message:</span><br/><em style="color:#ccc;">"${message}"</em></p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:15px;color:#ccc;line-height:1.7;">
                While you wait, feel free to explore our work or reach out to us directly on WhatsApp for a faster response.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                    <a href="https://wa.me/923251507557" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#fff;text-align:center;">
                Or visit us at <a href="https://codeverza.com" style="color:#b14cff;text-decoration:none;">codeverza.com</a>
              </p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(177,76,255,0.3),transparent);"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://wa.me/923251507557" title="WhatsApp">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width="28" height="28"
                        style="background:#25d366;border-radius:8px;padding:5px;display:block;" alt="WhatsApp"/>
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://instagram.com/codeverza" title="Instagram">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" width="28" height="28"
                        style="background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:8px;padding:5px;display:block;" alt="Instagram"/>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:13px;color:#fff;">
                📧 info@codeverza.com &nbsp;|&nbsp; 📞 +92 325 1507557 &nbsp;|&nbsp; 🇵🇰 Pakistan
              </p>
              <p style="margin:0;font-size:12px;color:#fff;">
                © ${new Date().getFullYear()} Codeverza. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Admin Notification Email ── */
function adminEmailHTML({ name, email, phone, service, message, source }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact – Codeverza</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:20px;overflow:hidden;border:1px solid rgba(177,76,255,0.25);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0030,#2d0050);padding:30px 40px;border-bottom:1px solid rgba(177,76,255,0.3);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png" alt="Codeverza" width="80" height="80"
                      style="vertical-align:middle;margin-right:12px;border-radius:8px;" />
                    <span style="font-size:20px;font-weight:900;color:#fff;vertical-align:middle;">Codeverza</span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(177,76,255,0.2);border:1px solid rgba(177,76,255,0.4);border-radius:50px;padding:5px 14px;font-size:12px;color:#b14cff;font-weight:700;">🔔 New Lead</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ALERT -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;">New Contact Form Submission</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#aaa;">Someone just reached out via <strong style="color:#e0aaff;">${source}</strong>. Reply promptly!</p>
            </td>
          </tr>

          <!-- DETAILS -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(177,76,255,0.06);border:1px solid rgba(177,76,255,0.2);border-radius:14px;">
                <tr><td style="padding:24px 28px;">
                  ${[
                    ['👤 Name',    name],
                    ['📧 Email',   email],
                    ['📞 Phone',   phone || 'Not provided'],
                    ['🛠️ Service', service || 'Not specified'],
                  ].map(([label, val]) => `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                    <tr>
                      <td width="130" style="font-size:13px;color:#888;font-weight:600;">${label}</td>
                      <td style="font-size:14px;color:#ddd;font-weight:500;">${val}</td>
                    </tr>
                  </table>`).join('')}
                  <div style="height:1px;background:rgba(177,76,255,0.15);margin:16px 0;"></div>
                  <p style="margin:0 0 6px;font-size:13px;color:#888;font-weight:600;">💬 Message</p>
                  <p style="margin:0;font-size:14px;color:#ccc;line-height:1.8;background:rgba(0,0,0,0.3);padding:14px 16px;border-radius:10px;border-left:3px solid #b14cff;">${message}</p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- REPLY CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                <tr>
                  <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                    <a href="mailto:${email}?subject=Re: Your inquiry at Codeverza" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">
                      📩 Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>
              ${phone ? `<a href="https://wa.me/${phone.replace(/\D/g,'')}" style="font-size:13px;color:#25d366;text-decoration:none;">💬 WhatsApp: ${phone}</a>` : ''}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#555;">Codeverza Admin Panel &nbsp;|&nbsp; © ${new Date().getFullYear()}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message, source } = body;

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send both emails in parallel
    await Promise.all([
      // 1. Thank you to user — sent FROM info@codeverza.com
      transporter.sendMail({
        from:     '"Codeverza" <info@codeverza.com>',
        replyTo:  'info@codeverza.com',
        to:       email,
        subject:  `Thank you for reaching out, ${name}! 🚀`,
        html:     userEmailHTML({ name, service, message }),
      }),
      // 2. Notification to admin — arrives AT info@codeverza.com
      transporter.sendMail({
        from:     '"Codeverza Alerts" <info@codeverza.com>',
        to:       process.env.ADMIN_EMAIL,
        subject:  `🔔 New Contact: ${name} – ${service || 'General Inquiry'}`,
        html:     adminEmailHTML({ name, email, phone, service, message, source }),
      }),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
