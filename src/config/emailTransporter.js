const nodemail = require('nodemailer')
const nodemailerStub = require('nodemailer-stub')
const transporter = nodemail.createTransport(nodemailerStub.stubTransport)

module.exports = transporter