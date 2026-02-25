const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"MONO Banking Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Mono Banking Ledger';
    const text = `Hello ${name},\n\nThank you for registering at MONO Banking Ledger.\nWe are excited to have you on board!\n\nBest regards,\nMONO Banking Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at MONO Banking Ledger.</p><p>We are excited to have you on board!</p><p>Best regards,<br>MONO Banking Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

const currentDateTimeString = new Date().toString();
async function sendTransactionCompletedEmail_fromUser(emailId, name, amount, fromAccountNumber, toAccountNumber) {
    const subject = 'Transaction Completed';
    const text = `\n${subject}\nHello ${name},\nYour a/c ${fromAccountNumber} debited for ${toAccountNumber} for Rs. ${amount} on ${currentDateTimeString}. If not you, report to MONO BANKING LEDGER\n\nBEST REGARDS,\nMONO BANKING LEDGER`;
    const html = `<p>${subject}</p><p>Hello ${name},</p><p>Your a/c ${fromAccountNumber} debited for ${toAccountNumber} for Rs. ${amount} on ${currentDateTimeString}. If not you, report to MONO BANKING LEDGER</p><p>BEST REGARDS,</p><p>MONO BANKING LEDGER</p>`

    await sendEmail(emailId, subject, text, html);
}

async function sendTransactionCompletedEmail_toUser(emailId, name, amount, fromAccountNumber, toAccountNumber) {
    const currentDateTimeString = new Date().toString();
    const subject = 'Credited Amount';
    const text = `\n${subject}\nHello ${name},\nYour a/c ${toAccountNumber} is credited with ${amount} on ${currentDateTimeString} from ${fromAccountNumber}.\n\nBEST REGARDS,\nMONO BANKING LEDGER`;

    const html = `<p>${subject}</p><p>Hello ${name},</p><p>Your a/c ${toAccountNumber} is credited with ${amount} on ${currentDateTimeString} from ${fromAccountNumber}.</p><p>BEST REGARDS,</p><p>MONO BANKING LEDGER</p>`

    await sendEmail(emailId, subject, text, html);
}

async function sendTransactionFailureEmail(emailId, name, amount, fromAccountNumber, toAccountNumber) {

    const subject = 'Transaction Failed';
    const text = `\nTransaction Failed\nHello ${name},\nThe transaction you tried from ${fromAccountNumber} account to ${toAccountNumber} of Rs. ${amount} failed. You can try again.\n\nBEST REGARDS,\nMONO BANKING LEDGER.`

    const html = `<p>${subject}</p><p>Hello ${name},</p><p>The transaction you tried from ${fromAccountNumber} account to ${toAccountNumber} of Rs. ${amount} failed. You can try again.</p><p>BEST REGARDS,</p><p>MONO BANKING LEDGER</p>`

    await sendEmail(emailId, subject, text, html);
}


module.exports = { sendRegistrationEmail, sendTransactionCompletedEmail_fromUser, sendTransactionCompletedEmail_toUser, sendTransactionFailureEmail }