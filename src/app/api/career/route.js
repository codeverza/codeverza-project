import nodemailer from 'nodemailer';

/* ── SMTP Transporter (careers@codeverza.com) ── */
const transporter = nodemailer.createTransport({
  host:   process.env.CAREERS_SMTP_HOST,
  port:   Number(process.env.CAREERS_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.CAREERS_SMTP_USER,
    pass: process.env.CAREERS_SMTP_PASS,
  },
});

/* ── User Confirmation Email ── */
function userEmailHTML({ name, position }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Received – Codeverza</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255, 255, 255, 1);letter-spacing:2px;text-transform:uppercase;">Software House</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;">
                Application Received! 🎉
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#ccc;line-height:1.7;">
                Hi <strong style="color:#e0aaff;">${name}</strong>, thank you for applying to Codeverza. Your form has been submitted successfully.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(177,76,255,0.08);border:1px solid rgba(177,76,255,0.2);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#b14cff;letter-spacing:2px;text-transform:uppercase;">Your Application</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#ddd;">
                      <span style="color:#999;">Position Applied:</span> <strong style="color:#e0aaff;">${position}</strong>
                    </p>
                    <p style="margin:0;font-size:14px;color:#ddd;line-height:1.7;">
                      <span style="color:#999;">Status:</span> <strong style="color:#4ade80;">Under Review</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#888;letter-spacing:1.5px;text-transform:uppercase;">What Happens Next</p>
                    ${[
                      ['📋', 'Our team will review your application carefully.'],
                      ['📞', 'If your profile matches, we will reach out to you as soon as possible.'],
                      ['🚀', 'Selected candidates will be guided through the next steps.'],
                    ].map(([icon, text]) => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="32" style="font-size:18px;vertical-align:top;padding-top:2px;">${icon}</td>
                        <td style="font-size:14px;color:#bbb;line-height:1.7;">${text}</td>
                      </tr>
                    </table>`).join('')}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:15px;color:#ccc;line-height:1.7;">
                In the meantime, feel free to explore our work or connect with us on WhatsApp if you have any questions.
              </p>

              <!-- CTA -->
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
                  // <td style="padding:0 6px;">
                  //   <a href="https://linkedin.com/company/codeverza" title="LinkedIn">
                  //     <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" width="28" height="28"
                  //       style="background:#0077b5;border-radius:8px;padding:5px;display:block;" alt="LinkedIn"/>
                  //   </a>
                  // </td>
                  // <td style="padding:0 6px;">
                  //   <a href="https://github.com/codeverza" title="GitHub">
                  //     <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" width="28" height="28"
                  //       style="background:#333;border-radius:8px;padding:5px;display:block;" alt="GitHub"/>
                  //   </a>
                  // </td>
                  <td style="padding:0 6px;">
                    <a href="https://instagram.com/codeverza" title="Instagram">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" width="28" height="28"
                        style="background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:8px;padding:5px;display:block;" alt="Instagram"/>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:13px;color:#fff;">
                📧 careers@codeverza.com &nbsp;|&nbsp; 📞 +92 325 1507557 &nbsp;|&nbsp; 🇵🇰 Pakistan
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
function adminEmailHTML({ name, email, phone, position, experience, linkedin, portfolio, coverLetter, cvFilename }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Career Application – Codeverza</title>
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
                    <span style="background:rgba(177,76,255,0.2);border:1px solid rgba(177,76,255,0.4);border-radius:50px;padding:5px 14px;font-size:12px;color:#b14cff;font-weight:700;">💼 New Applicant</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;">New Career Application</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#aaa;">A new applicant has submitted their application via the careers form.</p>
            </td>
          </tr>

          <!-- APPLICANT DETAILS -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(177,76,255,0.06);border:1px solid rgba(177,76,255,0.2);border-radius:14px;">
                <tr><td style="padding:24px 28px;">
                  ${[
                    ['👤 Name',       name],
                    ['📧 Email',      email],
                    ['📞 Phone',      phone || 'Not provided'],
                    ['💼 Position',   position],
                    ['📊 Experience', experience || 'Not specified'],
                    ['🔗 LinkedIn',   linkedin  || 'Not provided'],
                    ['🌐 Portfolio',  portfolio || 'Not provided'],
                  ].map(([label, val]) => `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                    <tr>
                      <td width="145" style="font-size:13px;color:#888;font-weight:600;vertical-align:top;padding-top:1px;">${label}</td>
                      <td style="font-size:14px;color:#ddd;font-weight:500;">${val}</td>
                    </tr>
                  </table>`).join('')}
                  <div style="height:1px;background:rgba(177,76,255,0.15);margin:16px 0;"></div>
                  <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;">📝 Cover Letter / Message</p>
                  <p style="margin:0;font-size:14px;color:#ccc;line-height:1.85;background:rgba(0,0,0,0.3);padding:14px 16px;border-radius:10px;border-left:3px solid #b14cff;">${coverLetter || 'Not provided'}</p>
                </td></tr>
              </table>
            </td>
          </tr>

          ${cvFilename ? `
          <!-- CV ATTACHED -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:14px;padding:0;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">📎 CV Attached</p>
                    <p style="margin:0;font-size:13px;color:#888;">${cvFilename} — See email attachment</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ''}

          <!-- REPLY CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                <tr>
                  <td style="border-radius:50px;background:linear-gradient(135deg,#b14cff,#6a00ff);">
                    <a href="mailto:${email}?subject=Re: Your Application at Codeverza" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:50px;">
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
              <p style="margin:0;font-size:12px;color:#555;">Codeverza Careers &nbsp;|&nbsp; © ${new Date().getFullYear()}</p>
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
    const formData = await req.formData();

    const name        = formData.get('name')        || '';
    const email       = formData.get('email')       || '';
    const phone       = formData.get('phone')       || '';
    const position    = formData.get('position')    || '';
    const experience  = formData.get('experience')  || '';
    const linkedin    = formData.get('linkedin')    || '';
    const portfolio   = formData.get('portfolio')   || '';
    const coverLetter = formData.get('coverLetter') || '';
    const cvFile      = formData.get('cv');

    if (!name || !email || !position) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare CV attachment if provided
    let cvAttachment = null;
    let cvFilename = null;
    if (cvFile && cvFile.size > 0) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      cvFilename = cvFile.name;
      cvAttachment = {
        filename: cvFilename,
        content: buffer,
        contentType: cvFile.type,
      };
    }

    await Promise.all([
      // 1. Confirmation to applicant — FROM careers@codeverza.com
      transporter.sendMail({
        from:     '"Codeverza Careers" <careers@codeverza.com>',
        replyTo:  'careers@codeverza.com',
        to:       email,
        subject:  `Application Received – ${position} at Codeverza 🚀`,
        html:     userEmailHTML({ name, position }),
      }),
      // 2. Notification to admin with CV attached
      transporter.sendMail({
        from:        '"Codeverza Careers" <careers@codeverza.com>',
        to:          'careers@codeverza.com',
        subject:     `💼 New Application: ${name} – ${position}`,
        html:        adminEmailHTML({ name, email, phone, position, experience, linkedin, portfolio, coverLetter, cvFilename }),
        attachments: cvAttachment ? [cvAttachment] : [],
      }),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Career email error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
