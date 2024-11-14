import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendAppointmentMessage = async (email, link) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Appointment Confirmation",
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                color: #333;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                            }
                            .container {
                                width: 100%;
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #ffffff;
                                border-radius: 8px;
                                overflow: hidden;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                background-color: #4CAF50;
                                color: #ffffff;
                                padding: 20px;
                                text-align: center;
                                font-size: 24px;
                            }
                            .content {
                                padding: 20px;
                                line-height: 1.6;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 20px;
                                margin: 20px 0;
                                color: #ffffff;
                                background-color: #4CAF50;
                                text-decoration: none;
                                border-radius: 4px;
                                font-weight: bold;
                                font-size: 16px;
                            }
                            .footer {
                                background-color: #f4f4f4;
                                color: #888;
                                font-size: 14px;
                                text-align: center;
                                padding: 10px 20px;
                                border-top: 1px solid #ddd;
                            }
                            .footer a {
                                color: #4CAF50;
                                text-decoration: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                Appointment Confirmation
                            </div>
                            <div class="content">
                                <p>Hello,</p>
                                <p>We’re reaching out to confirm your upcoming appointment. To view the details, please click the button below:</p>
                                <p style="text-align: center;">
                                    <a href="${link}" class="button">View Appointment Details</a>
                                </p>
                                <p>If you have any questions, feel free to contact us.</p>
                                <p>Best regards,</p>
                                <p>Your Team</p>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} PeerConnect. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `,
        });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export { sendAppointmentMessage };
