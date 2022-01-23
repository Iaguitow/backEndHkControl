const nodemailer = require('nodemailer');
const { google } =  require('googleapis');
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN});

async function sendEmail(to = "vieiras.igs@gmail.com",subject = "LOGIN RECOVERY", text = "1234"){
    try {
        const acessToken = await oAuth2Client.getAccessToken().catch(err =>{console.log(err.message); return;});
        const transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
                type: 'OAuth2',
                user: 'iowlportfolio@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: acessToken
            }
        });
        
        const mailOptions = {
            from: '"IOWL APP SUPPORT - NO REPLY." <iowlportfolio@gmail.com>',
            to: to,
            subject: subject,
            //text: "TEXTO QUE IRA DENTRO DO CORPO DO EMAiL SEM HTML.",
            html: "<h3>"+text+"<h3>",
        }

        const result = await transport.sendMail(mailOptions).catch(err =>{console.log(err.message); return;});
        return result;

    } catch (error) {
        return error;
    }
}

module.exports = {
    sendEmail,
}