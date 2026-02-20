const TransactionModel = require('../models/transaction.model');
const mongoose = require('mongoose');
const MessageService = require('../services/message.service');
const accountModel = require('../models/account.model');
const ledgerModel = require('../models/ledger.model');
const transactionModel = require('../models/transaction.model');


/**
 * - Create a new new Transaction
 * - Steps to transfer amount:
    * 1. Validate Request
    * 2. Validate Idempotency Key
    * 3. Check account status
    * 4. Drive sender balance from ledger - Aggregation pipeline
    * 5. Create Transaction (PENDING)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark Transaction Completed
    * 9. Commit MongoDB session
    * 10. Send transaction completed notification
 */
async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    /**
     * - Validate Request
     */
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "From Account, To Account, Amount and Idempotency Key are required",
            status: "failed"
        })
    }

    const fromAccountExist = await accountModel.findOne({ _id: fromAccount }).populate('user', 'phone name');
    const toAccountExist = await accountModel.findOne({ _id: toAccount }).populate('user', 'phone name');

    if (!fromAccountExist || !toAccountExist) {
        return res.status(400).json({
            message: "From Account or To Account does not exist",
            status: "failed"
        })
    }


    /**
     * - Validate Idempotency Key
     */
    const isTransactionExists = await TransactionModel.findOne({ idempotencyKey: idempotencyKey });
    if (isTransactionExists) {
        if (isTransactionExists.status === "SUCCESSFUL") {
            return res.status(200).json({
                message: "Transaction is processed with this Idempotency Key",
                transaction: isTransactionExists
            })
        }
        else if (isTransactionExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is pending",
                transaction: isTransactionExists
            })
        }
        else if (isTransactionExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction is failed, please try again"
            })
        }
        else if (isTransactionExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction is reversed, please try again"
            })
        }
    }


    /**
     * - Check account status
     */
    if (fromAccountExist.status !== "ACTIVE" || toAccountExist.status !== "ACTIVE") {
        return res.status(500).json({
            message: "Both Accounts (from and to) should be in ACTIVE status to process transaction",
        })
    }

    /**
     * - Drive sender balance from ledger - Aggregation pipeline
     */
    const balance = await fromAccountExist.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance, Your Current Balance is ${balance} and you are trying to send ${amount}.`,
            status: "failed"
        })
    }

    /**
     * either complete whole transaction or do not perform any of these processes, Either full or revert back
     * - Creating transaction (PENDING)
     * - StartSession, Provide the atomicity in transaction
     */
    const session = await mongoose.startSession();      // either complete whole transaction or do not perform any of these processes, Either full or revert back
    session.startTransaction();

    const transaction = new TransactionModel({
        fromAccount, toAccount, amount, idempotencyKey, status: 'PENDING'
    });
    transaction.save({ session });

    /**
     * - Debit Ledger Entry
     */
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        transaction: transaction._id,
        amount: amount,
        type: 'DEBIT'
    }], { session });

    /**
     * Making a promise, which simply means that in a transaction the amount deducted from fromAccount will definitely give a response even after few more time
     */
    await (() => {
        return new Promise((resolve)=> setTimeout(resolve, 1000))
    })()

    /**
     * - Credit Ledger Entry
     */
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,
        amount: amount,
        type: 'CREDIT'
    }], { session });

    // Mark transaction completed
    transaction.status = "SUCCESSFUL"
    await transaction.save({ session });

    // commit the mongoDB transaction
    await session.commitTransaction();
    session.endSession();   // end the session

    /**
     * - sending the sms regarding the transaction for both users (from and to users) 
     */
    // send successful sms confirmation to fromAccount USer
    await MessageService.sendTransactionCompletedSMS_fromUser(fromAccountExist.user.phone, fromAccountExist.user.name, amount, fromAccount, toAccount)

    // send successful sms confirmation to toAccount USer
    await MessageService.
        sendTransactionCompletedSMS_toUser(toAccountExist.user.phone, fromAccountExist.user.name, amount, fromAccount, toAccount)

    return res.status(201).json({
        message: "Transaction Completed Successfully",
        transaction: transaction
    })
}






async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "to Account, Amount and Idempotency Key are required",
        })
    }

    // the toUsrAccount is available or not
    const toUserAccount = await accountModel.findOne({ _id: toAccount }).populate('user', 'phone name');
    if (!toUserAccount) {
        return res.status(400).json({
            message: "To Account does not exist",
        })
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id }).populate('user', 'phone name');
    if (!fromUserAccount) {
        return res.status(400).json({
            message: "From Account does not exist",
        })
    }

    // starting the transaction session
    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = await transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING"
    })


    /**
     * - Debit Ledger Entry
     */
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        transaction: transaction._id,
        amount: amount,
        type: 'DEBIT'
    }], { session });

    /**
     * - Credit Ledger Entry
     */
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,
        amount: amount,
        type: 'CREDIT'
    }], { session });

    // Mark transaction completed
    transaction.status = "SUCCESSFUL"
    await transaction.save({ session });

    // commit the mongoDB transaction
    await session.commitTransaction();
    session.endSession();   // end the session

    /**
     * - sending the sms regarding the transaction for both users (from and to users) 
     */
    // send successful sms confirmation to fromAccount USer
    await MessageService.sendTransactionCompletedSMS_fromUser(fromUserAccount.user.phone, fromUserAccount.user.name, amount, fromUserAccount._id, toUserAccount._id)

    // send successful sms confirmation to toAccount USer
    await MessageService.
        sendTransactionCompletedSMS_toUser(toUserAccount.user.phone, fromUserAccount.user.name, amount, fromUserAccount._id, toUserAccount._id)


    console.log(`Transaction Completed Successfully - \n\tfrom : ${fromUserAccount._id}\n\tto : ${toUserAccount._id}\n\tamount : ${amount}`)
    return res.status(201).json({
        message: "Transaction Completed Successfully",
        transaction: transaction
    })
}

module.exports = { createTransaction};