// src/seeders/system.seed.js
const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");

async function seedSystemBalance() {
    const systemUser = await userModel.findOne({ systemUser: true });
    if (!systemUser) {
        console.log("System user not found");
        return;
    }

    const systemAccount = await accountModel.findOne({
        user: systemUser._id
    });

    if (!systemAccount) {
        console.log("System account not found");
        return;
    }

    // Check if already funded (very important)
    const existingCredit = await ledgerModel.findOne({
        account: systemAccount._id,
        type: "CREDIT"
    });

    if (existingCredit) {
        console.log("System already funded");
        return;
    }

    await ledgerModel.create({
        account: systemAccount._id,
        transaction: new mongoose.Types.ObjectId(),
        amount: 1000000,
        type: "CREDIT"
    });

    console.log("System initial balance credited");
}

module.exports = seedSystemBalance;