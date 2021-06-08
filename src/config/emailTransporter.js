const nodemail = require('nodemailer')
const transporter = nodemail.createTransport({
    host: 'localhost',
    port: 8587,
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter