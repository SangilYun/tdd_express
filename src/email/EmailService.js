const transporter = require('../config/emailTransporter')
const nodemailer = require('nodemailer')
const sendAccountActivation = async (email, token) => {
    const info = await transporter.sendMail({
        from:'My App <info@my-app.com>',
        to: email,
        subject: 'Account Activation',
        html: `
        <div>
            <p>Please click below link to activate your account</p>
        </div>
        <div>
            <a href="http://localhost:8080/#/login?token=${token}">Activate</a>
        </div>
        `
    })
    if(process.env.NODE_ENV === 'development'){
        console.log('url: ' + nodemailer.getTestMessageUrl(info))
    }
}

module.exports = { sendAccountActivation }