import { UniqueSchoolData } from '../../../types/definitions.js';

export const schoolApprovedTemplate = (data: UniqueSchoolData, urlData: { token: string }) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<title>Your School Has Been Approved by EduAdmin Pro</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse: collapse;}
.fallback-font {font-family: Arial, sans-serif;}
</style>
<![endif]-->
<style type="text/css">
  /* Client resets */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }

  /* iOS blue links */
  a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
  }
  /* Gmail blue links */
  u + #body a { color: inherit; text-decoration: none; }
  /* Samsung Mail blue links */
  #MessageViewBody a { color: inherit; text-decoration: none; }

  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .stack-column { display: block !important; width: 100% !important; }
    .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    .mobile-center { text-align: center !important; }
    .mobile-hide { display: none !important; }
    .h1-mobile { font-size: 22px !important; line-height: 28px !important; }
    .btn-mobile { width: 100% !important; }
  }

  @media (prefers-color-scheme: dark) {
    .dark-bg-outer { background-color: #0b1220 !important; }
    .dark-bg-card { background-color: #1e293b !important; }
    .dark-text-primary { color: #f1f5f9 !important; }
    .dark-text-secondary { color: #94a3b8 !important; }
    .dark-border { border-color: #334155 !important; }
    .dark-bg-info { background-color: #0f172a !important; }
    .dark-bg-notice { background-color: #0c1a0f !important; border-color: #166534 !important; }
  }
</style>
</head>
<body id="body" style="margin:0; padding:0; background-color:#f1f5f9; word-spacing:normal;">

<!-- Preheader text (hidden) -->
<div style="display:none; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all; font-family:sans-serif;">
  Great news! Your school has been approved on EduAdmin Pro. Click the link inside to set your password and start managing your school today.
</div>

<div role="article" aria-roledescription="email" lang="en" style="background-color:#f1f5f9;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="center">
<tr><td>
<![endif]-->

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="center" class="dark-bg-outer" style="background-color:#f1f5f9;">
  <tr>
    <td align="center" style="padding: 32px 16px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="width:600px; max-width:600px;">

        <!-- Logo / Header -->
        <tr>
          <td align="center" style="padding-bottom: 24px;" class="fallback-font">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 700; color: #0f172a;" class="dark-text-primary">
                  <span style="display:inline-block; width:32px; height:32px; background-color:#2563eb; border-radius:8px; color:#ffffff; text-align:center; line-height:32px; font-size:16px; margin-right:10px; vertical-align:middle;">&#127891;</span>
                  <span style="vertical-align:middle;">EduAdmin&nbsp;Pro</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Card -->
        <tr>
          <td style="background-color:#ffffff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);" class="dark-bg-card">

            <!-- Banner / checkmark icon -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="center" style="background-color:#16a34a; background-image:linear-gradient(135deg,#16a34a,#15803d); border-radius:16px 16px 0 0; padding: 36px 32px 30px 32px;" class="fallback-font">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="width:64px; height:64px; background-color:rgba(255,255,255,0.18); border-radius:50%; font-size:32px; line-height:64px; text-align:center;" class="fallback-font">
                        &#10004;
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 18px 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 22px; line-height: 28px; font-weight: 700; color: #ffffff;" class="h1-mobile">
                    Your school has been approved!
                  </p>
                  <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px; color: rgba(255,255,255,0.82);">
                    Welcome to EduAdmin Pro &mdash; let&rsquo;s get you set up.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Body content -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="mobile-padding" style="padding: 32px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin:0 0 16px 0; font-size:16px; line-height:24px; color:#0f172a;" class="dark-text-primary">
                    Hi ${data.users?.firstName},
                  </p>
                  <p style="margin:0 0 16px 0; font-size:15px; line-height:24px; color:#475569;" class="dark-text-secondary">
                    We&rsquo;re excited to let you know that <strong style="color:#0f172a;" class="dark-text-primary">${data.schools.schoolName}</strong> has been approved on <strong style="color:#0f172a;" class="dark-text-primary">EduAdmin&nbsp;Pro</strong>. Your account is ready, the only thing left to do is set your password, that's if you haven't done that already.
                  </p>
                  <p style="margin:0 0 24px 0; font-size:15px; line-height:24px; color:#475569;" class="dark-text-secondary">
                    Click the button below to create your password and access your dashboard. This link is valid for <strong style="color:#0f172a;" class="dark-text-primary">24 hours</strong> if it expires, you can click the <strong>forgot password</strong> link on the login page.
                  </p>
                </td>
              </tr>

              <!-- Account summary box -->
              <tr>
                <td class="mobile-padding" style="padding: 0 40px 8px 40px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;" class="dark-bg-info dark-border">
                    <tr>
                      <td style="padding: 20px 24px; font-family: Arial, Helvetica, sans-serif;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding-bottom:10px; font-size:11px; font-weight:700; letter-spacing:0.5px; color:#94a3b8; text-transform:uppercase;">
                              School Name
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:16px; font-size:15px; font-weight:600; color:#0f172a;" class="dark-text-primary">
                              ${data.schools.schoolName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:10px; font-size:11px; font-weight:700; letter-spacing:0.5px; color:#94a3b8; text-transform:uppercase;">
                              Account Email
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:16px; font-size:15px; font-weight:600; color:#0f172a;" class="dark-text-primary">
                              ${data.schools.email}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:10px; font-size:11px; font-weight:700; letter-spacing:0.5px; color:#94a3b8; text-transform:uppercase;">
                              Approved On
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size:15px; font-weight:600; color:#0f172a;" class="dark-text-primary">
                              ${new Date().toUTCString()}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA button -->
              <tr>
                <td align="center" class="mobile-padding" style="padding: 28px 40px 8px 40px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${process.env.BASE_URL}/reset-password?token=${urlData.token}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="18%" stroke="f" fillcolor="#16a34a">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Set My Password &amp; Log In</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${process.env.BASE_URL}/reset-password?token=${urlData.token}" target="_blank" class="btn-mobile" style="display:inline-block; background-color:#16a34a; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; line-height:50px; text-align:center; text-decoration:none; border-radius:9px; width:280px; -webkit-text-size-adjust:none; mso-hide:all;">
                          Set My Password &amp; Log In
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 16px 0 0 0; font-size:12.5px; line-height:20px; color:#94a3b8;">
                    This link expires in <strong>24 hours</strong>. Request a new one from the login page if needed.
                  </p>
                </td>
              </tr>

              <!-- Fallback link -->
              <tr>
                <td class="mobile-padding" style="padding: 20px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin:0 0 6px 0; font-size:12.5px; line-height:20px; color:#94a3b8;">
                    Button not working? Copy and paste this link into your browser:
                  </p>
                  <p style="margin:0; font-size:12.5px; line-height:20px; word-break:break-all;">
                    <a href="${process.env.BASE_URL}/reset-password?token=${urlData.token}" style="color:#16a34a; text-decoration:underline;">${process.env.BASE_URL}/reset-password?token=${urlData.token}</a>
                  </p>
                </td>
              </tr>

              <!-- What you can do now -->
              <tr>
                <td class="mobile-padding" style="padding: 20px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;" class="dark-bg-notice">
                    <tr>
                      <td style="padding: 20px 24px; font-family: Arial, Helvetica, sans-serif;">
                        <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:#166534;">
                          &#127775;&nbsp; What you can do once you&rsquo;re in
                        </p>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" style="padding-bottom:8px; padding-right:10px; width:20px; font-size:13px; line-height:20px; color:#16a34a;">&#10003;</td>
                            <td valign="top" style="padding-bottom:8px; font-size:13px; line-height:20px; color:#15803d;">
                              <strong>Manage students &amp; staff</strong> &mdash; add, organise, and track everyone at your school.
                            </td>
                          </tr>
                          <tr>
                            <td valign="top" style="padding-bottom:8px; padding-right:10px; width:20px; font-size:13px; line-height:20px; color:#16a34a;">&#10003;</td>
                            <td valign="top" style="padding-bottom:8px; font-size:13px; line-height:20px; color:#15803d;">
                              <strong>Set up classes &amp; timetables</strong> &mdash; organise your academic calendar with ease.
                            </td>
                          </tr>
                          <tr>
                            <td valign="top" style="padding-right:10px; width:20px; font-size:13px; line-height:20px; color:#16a34a;">&#10003;</td>
                            <td valign="top" style="font-size:13px; line-height:20px; color:#15803d;">
                              <strong>Track fees &amp; generate reports</strong> &mdash; stay on top of finances and performance.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td class="mobile-padding" style="padding: 24px 40px 0 40px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="border-top:1px solid #e2e8f0; font-size:0; line-height:0;" class="dark-border">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Need help note -->
              <tr>
                <td class="mobile-padding" style="padding: 20px 40px 32px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin:0; font-size:13px; line-height:20px; color:#94a3b8;">
                    <strong style="color:#475569;" class="dark-text-secondary">Need help getting started?</strong> Our support team is available to walk you through the platform. If you didn&rsquo;t sign up for EduAdmin Pro or believe this approval was made in error, please contact us immediately so we can look into it.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 28px 24px 0 24px; font-family: Arial, Helvetica, sans-serif;">
            <p style="margin:0 0 8px 0; font-size:12.5px; line-height:20px; color:#94a3b8;">
              EduAdmin Pro &middot; Management System for Modern Schools
            </p>
            <p style="margin:0 0 8px 0; font-size:12px; line-height:18px; color:#cbd5e1;">
              This is an automated message, please do not reply directly to this email.
            </p>
            <p style="margin:0; font-size:12px; line-height:18px; color:#cbd5e1;">
              &copy; ${new Date().getFullYear()} EduAdmin Pro. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

<!--[if mso]>
</td></tr>
</table>
<![endif]-->
</div>
</body>
</html>
`;
