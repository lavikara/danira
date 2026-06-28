import { SignupSchoolInput } from '../../../middleware/zodvalidate/schema/school/schoolSchemas.js';

export const userCrateSchoolTemplate = (data: SignupSchoolInput) => `
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
<title>Your EduAdmin Pro Application is Under Review</title>
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
  Thanks for signing up! Your EduAdmin Pro application is pending review. We'll email you once it's approved so you can set your password and get started.
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

            <!-- Banner / hourglass icon -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="center" style="background-color:#0284c7; background-image:linear-gradient(135deg,#0284c7,#0369a1); border-radius:16px 16px 0 0; padding: 36px 32px 30px 32px;" class="fallback-font">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="width:64px; height:64px; background-color:rgba(255,255,255,0.18); border-radius:50%; font-size:32px; line-height:64px; text-align:center;" class="fallback-font">
                        &#9203;
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 18px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 22px; line-height: 28px; font-weight: 700; color: #ffffff;" class="h1-mobile">
                    Application under review
                  </p>
                </td>
              </tr>
            </table>

            <!-- Body content -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="mobile-padding" style="padding: 32px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin:0 0 16px 0; font-size:16px; line-height:24px; color:#0f172a;" class="dark-text-primary">
                    Hi ${data.adminData.firstName},
                  </p>
                  <p style="margin:0 0 16px 0; font-size:15px; line-height:24px; color:#475569;" class="dark-text-secondary">
                    Thank you for registering <strong style="color:#0f172a;" class="dark-text-primary">${data.schoolData.schoolName}</strong> on <strong style="color:#0f172a;" class="dark-text-primary">EduAdmin&nbsp;Pro</strong>. We've received your application and it is currently being reviewed by our team.
                  </p>
                  <p style="margin:0 0 24px 0; font-size:15px; line-height:24px; color:#475569;" class="dark-text-secondary">
                    Once your application is approved, you will receive a separate email with a link to set your password and access your account. This usually takes <strong style="color:#0f172a;" class="dark-text-primary">1&ndash;2 business days</strong>.
                  </p>
                </td>
              </tr>

              <!-- Application summary box -->
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
                              ${data.schoolData.schoolName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:10px; font-size:11px; font-weight:700; letter-spacing:0.5px; color:#94a3b8; text-transform:uppercase;">
                              Account Email
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:16px; font-size:15px; font-weight:600; color:#0f172a;" class="dark-text-primary">
                              ${data.adminData.email}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:10px; font-size:11px; font-weight:700; letter-spacing:0.5px; color:#94a3b8; text-transform:uppercase;">
                              Submitted On
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

              <!-- What happens next -->
              <tr>
                <td class="mobile-padding" style="padding: 20px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;" class="dark-bg-notice">
                    <tr>
                      <td style="padding: 20px 24px; font-family: Arial, Helvetica, sans-serif;">
                        <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:#166534;">
                          &#9989;&nbsp; What happens next?
                        </p>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" style="padding-bottom:10px; padding-right:12px; font-size:22px; line-height:1; color:#16a34a; width:28px;">1</td>
                            <td valign="top" style="padding-bottom:10px; font-size:13px; line-height:20px; color:#15803d;">
                              <strong>Our team reviews your application</strong> &mdash; we verify your school details to ensure everything is in order.
                            </td>
                          </tr>
                          <tr>
                            <td valign="top" style="padding-bottom:10px; padding-right:12px; font-size:22px; line-height:1; color:#16a34a; width:28px;">2</td>
                            <td valign="top" style="padding-bottom:10px; font-size:13px; line-height:20px; color:#15803d;">
                              <strong>You receive an approval email</strong> &mdash; containing a secure link to set your password.
                            </td>
                          </tr>
                          <tr>
                            <td valign="top" style="padding-right:12px; font-size:22px; line-height:1; color:#16a34a; width:28px;">3</td>
                            <td valign="top" style="font-size:13px; line-height:20px; color:#15803d;">
                              <strong>You log in and get started</strong> &mdash; your full EduAdmin Pro dashboard is ready to use.
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
                    <strong style="color:#475569;" class="dark-text-secondary">Questions or need help?</strong> If you haven't heard from us within 2 business days, or if you believe you submitted incorrect details during signup, please contact our support team and we'll be happy to assist.
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
