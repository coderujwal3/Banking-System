require('dotenv').config();
const twilio = require('twilio');


const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const currentDateTimeString = new Date().toString();
/**
 * - Create a new Client who sends sms automatically
 */
const client = new twilio(accountSID, authToken);
try {
    if (client) {
        console.log("\n📃📃📃 Client Created Successfully, SMS Service is ready to send SMSs 📃📃📃\n");
    }
} catch (error) {
    console.error('Error creating Twilio client:', error);
}

async function sendSMS(toNumber, messageBody) {
    try {
        const info = await client.messages.create({
            body: messageBody,
            from: fromNumber,
            to: toNumber
        }).then(message => console.log('Message sent: %s', message.sid));
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

async function sendRegistrationSMS(toNumber, name) {
    const headline = 'Welcome to Mono Banking Ledger';
    const text = `\n${headline}\nHello ${name},\nThank you for registering at MONO Banking Ledger.\nWe are excited to have you on board!\n\nBest regards,\nMONO Banking Ledger Team`;

    await sendSMS(toNumber, text);

}


async function sendTransactionCompletedSMS_fromUser(toNumber, name, amount, fromAccountNumber, toAccountNumber) {
    const headline = 'Transaction Completed';
    const text = `\n${headline}\nHello ${name},\nYour a/c ${fromAccountNumber} debited for ${toAccountNumber} for Rs. ${amount} on ${currentDateTimeString}. If not you, report to MONO BANKING LEDGER\n\nBEST REGARDS,\nMONO BANKING LEDGER`;

    await sendSMS(toNumber, text);
}

async function sendTransactionCompletedSMS_toUser(toNumber, name, amount, fromAccountNumber, toAccountNumber) {
    const currentDateTimeString = new Date().toString();
    const headline = 'Credited Amount';
    const text = `\n${headline}\nHello ${name},\nYour a/c ${toAccountNumber} is credited with ${amount} on ${currentDateTimeString} on ${currentDateTimeString} from ${fromAccountNumber}.\n\nBEST REGARDS,\nMONO BANKING LEDGER`;

    await sendSMS(toNumber, text);
}

async function sendTransactionFailure(toNumber, name, amount, fromAccountNumber, toAccountNumber) {
    const text = `\nTransaction Failed\nHello ${name},\nThe transaction you tried from ${fromAccountNumber} account to ${toAccountNumber} of Rs. ${amount} failed. You can try again.\n\nBEST REGARDS,\nMONO BANKING LEDGER.`

    await sendSMS(toNumber, text);
}

module.exports = { sendRegistrationSMS, sendTransactionCompletedSMS_fromUser, sendTransactionCompletedSMS_toUser, sendTransactionFailure }