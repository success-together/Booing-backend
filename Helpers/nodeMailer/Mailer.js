const nodemailer = require("nodemailer");

//step 1 mailer
module.exports.sendMail = (to, subject, text, code) => {
  let transporter = nodemailer.createTransport({
    host: "smtps.aruba.it",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
  });
  console.log(process.env.ADMIN_EMAIL, process.env.PASSWORD_EMAIL)
  // Step 2
  let mailOptions = {
    from: "support@booing.cloud", // TODO: email sender
    to: to, // TODO: email receiver
    subject: subject,
    text: text,
    html: `<!DOCTYPE html>
    <html>
    <head>
    
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
      /**
       * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
       */
      @media screen {
        @font-face {
          font-family: 'Source Sans Pro';
          font-style: normal;
          font-weight: 400;
          src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
        }
        @font-face {
          font-family: 'Source Sans Pro';
          font-style: normal;
          font-weight: 700;
          src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
        }
      }
      /**
       * Avoid browser level font resizing.
       * 1. Windows Mobile
       * 2. iOS / OSX
       */
      body,
      table,
      td,
      a {
        -ms-text-size-adjust: 100%; /* 1 */
        -webkit-text-size-adjust: 100%; /* 2 */
      }
      /**
       * Remove extra space added to tables and cells in Outlook.
       */
      table,
      td {
        mso-table-rspace: 0pt;
        mso-table-lspace: 0pt;
      }
      /**
       * Better fluid images in Internet Explorer.
       */
      img {
     
        -ms-interpolation-mode: bicubic;
      }
      /**
       * Remove blue links for iOS devices.
       */
      a[x-apple-data-detectors] {
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        color: inherit !important;
        text-decoration: none !important;
      }
      /**
       * Fix centering issues in Android 4.4.
       */
      div[style*="margin: 16px 0;"] {
        margin: 0 !important;
      }
      body {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      /**
       * Collapse table borders to avoid space between cells.
       */
      table {
        border-collapse: collapse !important;
      }
      a {
        color: #1a82e2;
      }
      img {
        height: auto;
        line-height: 100%;
        text-decoration: none;
        border: 0;
        outline: none;
      }
      </style>
    
    </head>
    <body style="background-color: #e9ecef;">
    
      <!-- start preheader -->
      <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
        A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
      </div>
      <!-- end preheader -->
    
      <!-- start body -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
    
        <!-- start logo -->
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="center" valign="top" style="padding: 36px 24px; background-color:#1a82e2;">
                  <a href="" target="_blank" style="display: inline-block;">
                    <img src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAAA1CAMAAAB7lYmuAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAwBQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Bz0LCAAAAQB0Uk5TAA5Ea6PR6e3dt5BZHwOq6/3/+MZxAhaI+dPFwcpBBKD34J4pGxcgRmy+KzgL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" alt="Logo" border="0" width="150" style="display: block; width: 150px; max-width: 150px; min-width: 48px;">
                  </a>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
        <!-- end logo -->
    
        <!-- start hero -->
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">${subject}</h1>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
        <!-- end hero -->
    
        <!-- start copy block -->
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
    
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;"> ${text} <br/> <br/> <b>Your Code :</b></p>
                </td>
              </tr>
              <!-- end copy -->
    
              <!-- start button -->
              <tr>
                <td align="left" bgcolor="#ffffff">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                              <p style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;"> <b> ${code} <b></p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end button -->
    
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">This code will expire in 1 hour. If you did not sign up for a Booing account,
    you can safely ignore this email.</p>
                  
                </td>
              </tr>
              <!-- end copy -->
    
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                  <p style="margin: 0;">Best,<br> Booing team.</p>
                </td>
              </tr>
              <!-- end copy -->
    
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
        <!-- end copy block -->
    
        <!-- start footer -->
        <tr>
          <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
    
              <!-- start permission -->
              <tr>
                <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                  <p style="margin: 0;">You received this email because we received a request for ${subject} for your account. If you didn't request ${subject} you can safely delete this email.</p>
                </td>
              </tr>
              <!-- end permission -->
    
              <!-- start unsubscribe -->
              <tr>
                <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                  <p style="margin: 0;">To stop receiving these emails, you can <a href="https://www.booing.com" target="_blank">unsubscribe</a> at any time.</p>
                  <p style="margin: 0;"></p>
                </td>
              </tr>
              <!-- end unsubscribe -->
    
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
        <!-- end footer -->
    
      </table>
      <!-- end body -->
    
    </body>
    </html>`,
  };

  // Step 3
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err)
      return { err };
    }
    return info;
  });
};
