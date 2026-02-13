const mongoose = require("mongoose")


const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, "From account is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, "From account is required"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED'],
            message: "Status can be either PENDING, SUCCESSFUL, FAILED or REVERSED"
        },
        default: 'PENDING'
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for banking transactions"],
        min: [0, "Amount cannot be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        unique: true,
        index: true
    }
}, {
    timestamps: true
})


const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;