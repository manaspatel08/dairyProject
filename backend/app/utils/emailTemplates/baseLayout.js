export const baseLayout = ({ title, body }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- HEADER / BANNER -->
          <tr>
            <td style="background:#d32f2f; color:#fff; padding:20px; text-align:center;">
              <h1 style="margin:0; font-size:22px;">Fresh Dairy Delivered</h1>
              <p style="margin:5px 0 0; font-size:14px;">
                Reliable • Fresh • On Time
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:24px; color:#333; font-size:14px; line-height:1.6;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f2f2f2; padding:15px; text-align:center; font-size:12px; color:#777;">
              Need help? Contact us at
              <a href="mailto:support@gmail.com" style="color:#d32f2f; text-decoration:none;">
                support@gmail.com
              </a>
              <br/>
              © ${new Date().getFullYear()} DairyProduct
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
