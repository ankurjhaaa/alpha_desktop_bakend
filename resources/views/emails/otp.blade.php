<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); font-size: 16px;">
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background-color: #2563eb; padding: 35px 20px; text-align: center;">
                            <h2 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; font-family: inherit;">Alpha Graphics</h2>
                        </td>
                    </tr>
                    
                    <!-- Content Area -->
                    <tr>
                        <td style="padding: 40px 30px; font-family: inherit;">
                            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; font-family: inherit;">Password Reset Request</h3>
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                                Hello,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                                We received a request to reset the password for your account. Please use the following 6-digit One-Time Password (OTP) to complete the verification process:
                            </p>
                            
                            <!-- Dotted OTP Container -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 8px; padding: 22px 10px;">
                                        <span style="font-size: 36px; font-weight: 800; color: #1d4ed8; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; display: block; margin-left: 8px;">{{ $otp }}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Expiry Notice -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px; border-left: 4px solid #ef4444; background-color: #fef2f2; border-radius: 0 4px 4px 0;">
                                <tr>
                                    <td style="padding: 12px 16px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #b91c1c; font-weight: 600;">
                                            This OTP code is valid for exactly 10 minutes. For security reasons, please do not share this code with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;" />
                            
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer Area -->
                    <tr>
                        <td align="center" style="background-color: #f1f5f9; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; font-family: inherit; line-height: 1.4;">
                                &copy; {{ date('Y') }} Alpha Graphics. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: inherit; line-height: 1.4;">
                                This is an automated email notification. Please do not reply directly to this mail.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
