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

function replyEmailHTML({ userName, userMessage, replyMessage }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reply from Codeverza</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:20px;overflow:hidden;border:1px solid rgba(177,76,255,0.25);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0030,#2d0050,#1a0030);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(177,76,255,0.3);">
              <img src="https://raw.githubusercontent.com/codeverza02/codeverza/main/public/img/codeverza-logo.png"
                alt="Codeverza" width="120" height="120"
                style="display:block;margin:0 auto 14px;border-radius:12px;" />
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;">
                Code<span style="color:#b14cff;">verza</span>
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">Software House</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px;font-size:15px;color:#ccc;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#aaa;line-height:1.7;">
                Thank you for reaching out to us. Here is our reply to your inquiry:
              </p>

              <!-- Reply message -->
              <div style="background:linear-gradient(135deg,rgba(177,76,255,0.1),rgba(106,0,255,0.08));border:1px solid rgba(177,76,255,0.25);border-left:4px solid #b14cff;border-radius:14px;padding:22px 24px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#b14cff;letter-spacing:2px;text-transform:uppercase;">Our Reply</p>
                <p style="margin:0;font-size:15px;color:#ddd;line-height:1.85;white-space:pre-wrap;">${replyMessage}</p>
              </div>

              <!-- Original message -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 22px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#555;letter-spacing:2px;text-transform:uppercase;">Your Original Message</p>
                <p style="margin:0;font-size:14px;color:#777;line-height:1.8;font-style:italic;">"${userMessage}"</p>
              </div>

              <p style="margin:0 0 28px;font-size:14px;color:#888;line-height:1.7;">
                If you have any further questions, feel free to reply to this email or reach us on WhatsApp.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                    <a href="https://wa.me/923251507557" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
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
            <td style="padding:22px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
                <tr>
                  <td style="padding:0 6px;"><a href="https://wa.me/923251507557"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width="24" height="24" style="background:#25d366;border-radius:6px;padding:4px;display:block;" alt="WhatsApp"/></a></td>
                  <td style="padding:0 6px;"><a href="https://linkedin.com/company/codeverza"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" width="24" height="24" style="background:#0077b5;border-radius:6px;padding:4px;display:block;" alt="LinkedIn"/></a></td>
                  <td style="padding:0 6px;"><a href="https://instagram.com/codeverza"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" width="24" height="24" style="background:#e535ab;border-radius:6px;padding:4px;display:block;" alt="Instagram"/></a></td>
                </tr>
              </table>
              <p style="margin:0 0 4px;font-size:12px;color:#555;">📧 info@codeverza.com &nbsp;|&nbsp; 📞 +92 325 1507557</p>
              <p style="margin:0;font-size:11px;color:#444;">© ${new Date().getFullYear()} Codeverza. All rights reserved.</p>
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
    const { userName, userEmail, userMessage, replyMessage } = await req.json();

    if (!userEmail || !replyMessage) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Reply sent FROM info@codeverza.com
    await transporter.sendMail({
      from:     '"Codeverza" <info@codeverza.com>',
      replyTo:  'info@codeverza.com',
      to:       userEmail,
      subject:  `Re: Your inquiry at Codeverza`,
      html:     replyEmailHTML({ userName, userMessage, replyMessage }),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Reply email error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
