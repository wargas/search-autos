import nodemailer from "nodemailer";

const auth = {
    host: 'smtp.hostinger.com',
    port: 587,
    auth: {
        user: 'admin',
        pass: 'Wrgs2703!'
    }
}
const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)


await transport.verify()

const info = await transport.sendMail({
    from: 'admin@deltex.com.br',
    to: 'teixeira.wargas@gmail.com',
    subject: 'TESTE',
    text: 'OLA MUNDO'
})

console.log(info.messageId)
//EMAIL_SERVER=smtp://admin@Wrgs2703!@smtp.hostinger.com
