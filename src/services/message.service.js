const dotenv = require('dotenv');
dotenv.config();
const twilio = require('twilio');


const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * - Create a new Client who sends sms automatically
 */
const client = new twilio(accountSID, authToken);

async function sendSMS(toNumber, messageBody) {
    try {
        const info = await client.messages.create({
            body: messageBody,
            from: fromNumber,
            to: toNumber
        })
        console.log('Message sent: %s', info.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

async function sendRegistrationSMS(toNumber, name) {
    const headline = 'Welcome to Mono Banking Ledger';
    const text = `\n${headline}\nHello ${name},\nThank you for registering at MONO Banking Ledger.\nWe are excited to have you on board!\n\nBest regards,\nMONO Banking Ledger Team`;

    await sendSMS(toNumber, text);

}


module.exports = { sendRegistrationSMS }