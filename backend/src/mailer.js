const express = require('express')
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'brainyplays222@gmail.com',
        pass: 'ealfqbpcilxnvbmz',
    },
})
const mailOptions = {
    from: 'brainyplays222@gmail.com',
    to: 'dhirajkhali1@gmail.com',
    subject: 'Password Reset',
    text: `Click on the following link to reset your password:}`,
}

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error)
    }
    console.log('Email sent: ' + info.response)
})
