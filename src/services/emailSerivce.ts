import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

class EmailService {
    async sendEmail(to: string, subject: string, text: string) {

        console.log('Sending email to:', to);
        
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_ADDRESS,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken.token || '',
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to,
            subject,
            text,
        });
    }
}

export default new EmailService();