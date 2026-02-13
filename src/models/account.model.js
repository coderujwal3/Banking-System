const mongoose = require('mongoose')
const ledgerModel = require('./ledger.model')

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,        // using these index we can easily find the user
        ref: 'User',
        required: [true, 'Account must me associated with a user']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: "INR"
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'FROZEN', 'INACTIVE'],
            status: "Status can be either ACTIVE, FROZEN or INACTIVE",
        },
        default: "ACTIVE"
    }
}, {
    timestamps: true
});


// account index (compound unique index for optimizing the search)
accountSchema.index({ user: 1, currency: 1});

const accountModel = mongoose.model('account', accountSchema);
module.exports = accountModel;