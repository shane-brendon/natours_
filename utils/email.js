const nodemailer = require('nodemailer')
module.exports = class Email {
  contructor(user, url) {
    this.to = user.email
    this.firstname = user.name.split(" ")[0]
    this.url = url
    this.from =  `Brendon Shane <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if(process.env.NODE_ENV === 'production') {
      return 1
    }
    nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async send(template, subject) {
    const html =  `<div> this is an email </div>`
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: options.message,
      // html
    }

    await this.newTransportawait.sendMail(mailOptions)
  }
  
  async sendWelcome() {
    await this.send('welcome', 'welcome to the natours family')
  }

  async sendPasswordReset() {
    await this.send('password reset', 'your password reset token')
  }
}

