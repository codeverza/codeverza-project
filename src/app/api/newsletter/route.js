import nodemailer from 'nodemailer';

/* ── SMTP Transporter ── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ── Newsletter Welcome Email ── */
function newsletterWelcomeHTML(email) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Codeverza Newsletter</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">Newsletter</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background:rgba(177,76,255,0.12);border:1px solid rgba(177,76,255,0.3);border-radius:50px;padding:8px 18px;">
                  <span style="font-size:13px;color:#b14cff;letter-spacing:1px;text-transform:uppercase;font-weight:600;">✉️ You're Subscribed!</span>
                </div>
              </div>

              <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#fff;text-align:center;">
                Welcome to the <span style="background:linear-gradient(135deg,#b14cff,#e0aaff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Codeverza</span> Community! 🎉
              </h2>
              
              <p style="margin:0 0 24px;font-size:15px;color:#ccc;line-height:1.8;text-align:center;">
                Thank you for subscribing to our newsletter! You're now part of an exclusive community that stays ahead in the world of tech and innovation.
              </p>

              <!-- What to Expect -->
              <div style="background:rgba(177,76,255,0.08);border:1px solid rgba(177,76,255,0.2);border-radius:14px;padding:28px;margin-bottom:28px;">
                <h3 style="margin:0 0 18px;font-size:18px;font-weight:800;color:#fff;text-align:center;">
                  📬 What You'll Receive
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;">
                      <div style="display:flex;align-items:flex-start;">
                        <span style="font-size:24px;margin-right:12px;">🚀</span>
                        <div>
                          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#e0aaff;">Latest Tech Updates</p>
                          <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">Stay informed about cutting-edge technologies, frameworks, and development trends.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <div style="display:flex;align-items:flex-start;">
                        <span style="font-size:24px;margin-right:12px;">💡</span>
                        <div>
                          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#e0aaff;">Project Insights</p>
                          <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">Get behind-the-scenes looks at our latest projects and case studies.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <div style="display:flex;align-items:flex-start;">
                        <span style="font-size:24px;margin-right:12px;">🎓</span>
                        <div>
                          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#e0aaff;">Expert Tips & Tutorials</p>
                          <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">Learn from our team's expertise with practical guides and best practices.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <div style="display:flex;align-items:flex-start;">
                        <span style="font-size:24px;margin-right:12px;">🎁</span>
                        <div>
                          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#e0aaff;">Exclusive Offers</p>
                          <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">Be the first to know about special promotions and early-bird opportunities.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin:0 0 28px;font-size:15px;color:#ccc;line-height:1.8;text-align:center;">
                We promise to deliver <strong style="color:#e0aaff;">valuable content</strong> directly to your inbox. No spam, just quality updates that matter to you. 📧✨
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                    <a href="https://codeverza.com" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">
                      🌐 Visit Our Website
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0 0 10px;font-size:14px;color:#888;line-height:1.7;">
                  Have a project in mind? Let's build something amazing together!
                </p>
                <a href="https://wa.me/923251507557" style="font-size:14px;color:#25d366;text-decoration:none;font-weight:600;">
                  💬 Chat on WhatsApp
                </a>
              </div>
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
                  <td style="padding:0 6px;">
                    <a href="https://github.com/codeverza02" title="GitHub">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" width="28" height="28"
                        style="background:#333;border-radius:8px;padding:5px;display:block;" alt="GitHub"/>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:13px;color:#fff;">
                📧 info@codeverza.com &nbsp;|&nbsp; 📞 +92 325 1507557 &nbsp;|&nbsp; 🇵🇰 Pakistan
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#fff;">
                © ${new Date().getFullYear()} Codeverza. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#555;">
                You're receiving this because you subscribed to our newsletter at codeverza.com
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

/* ── Admin Notification for Newsletter Subscription ── */
function adminNewsletterNotification(email) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Newsletter Subscriber</title>
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
                    <span style="background:rgba(177,76,255,0.2);border:1px solid rgba(177,76,255,0.4);border-radius:50px;padding:5px 14px;font-size:12px;color:#b14cff;font-weight:700;">📬 New Subscriber</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#fff;">New Newsletter Subscription 🎉</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#aaa;">Someone just subscribed to your newsletter!</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(177,76,255,0.06);border:1px solid rgba(177,76,255,0.2);border-radius:14px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="100" style="font-size:13px;color:#888;font-weight:600;">📧 Email</td>
                        <td style="font-size:15px;color:#e0aaff;font-weight:600;">${email}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:16px;">
                          <div style="height:1px;background:rgba(177,76,255,0.15);margin:12px 0;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#888;font-weight:600;">📅 Date</td>
                        <td style="font-size:14px;color:#ddd;">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#888;font-weight:600;padding-top:12px;">📍 Source</td>
                        <td style="font-size:14px;color:#ddd;padding-top:12px;">Footer Newsletter Form</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Send both emails in parallel
    await Promise.all([
      // 1. Welcome email to subscriber — sent FROM info@codeverza.com
      transporter.sendMail({
        from:     '"Codeverza" <info@codeverza.com>',
        replyTo:  'info@codeverza.com',
        to:       email,
        subject:  `Welcome to Codeverza Newsletter! 🚀`,
        html:     newsletterWelcomeHTML(email),
      }),
      // 2. Notification to admin — arrives AT info@codeverza.com
      transporter.sendMail({
        from:     '"Codeverza Alerts" <info@codeverza.com>',
        to:       process.env.ADMIN_EMAIL,
        subject:  `📬 New Newsletter Subscriber: ${email}`,
        html:     adminNewsletterNotification(email),
      }),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Newsletter email error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
