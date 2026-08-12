import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function broadcastHTML({ subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:20px;overflow:hidden;border:1px solid rgba(177,76,255,0.25);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a0030,#2d0050,#1a0030);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(177,76,255,0.3);">
            <img src="https://raw.githubusercontent.com/codeverza02/codeverza/main/public/img/cc-logo-new.png" alt="Codeverza" width="64" height="64" style="display:block;margin:0 auto 14px;border-radius:12px;"/>
            <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;">Code<span style="color:#b14cff;">verza</span></h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">Software House</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#fff;">${subject}</h2>
            <div style="font-size:15px;color:#ccc;line-height:1.85;white-space:pre-wrap;">${message}</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(177,76,255,0.3),transparent);margin:28px 0;"></div>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                  <a href="https://codeverza.vercel.app" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">Visit Codeverza</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0 0 4px;font-size:12px;color:#555;">📧 codeverza02@gmail.com &nbsp;|&nbsp; 🇵🇰 Pakistan</p>
            <p style="margin:0;font-size:11px;color:#444;">© ${new Date().getFullYear()} Codeverza. You received this because you subscribed or contacted us.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req) {
  try {
    const { subject, message, recipients } = await req.json();
    if (!subject || !message || !recipients?.length) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Deduplicate recipients
    const uniqueRecipients = [...new Set(recipients.map(e => e.toLowerCase().trim()).filter(Boolean))];

    const html = broadcastHTML({ subject, message });
    const results = await Promise.allSettled(
      uniqueRecipients.map(email =>
        transporter.sendMail({
          from: `"Codeverza" <${process.env.GMAIL_USER}>`,
          to: email,
          subject,
          html,
        })
      )
    );

    const sent   = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    return Response.json({ success: true, sent, failed });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
