const { Router } = require('express');
const transactionController = require("../controllers/transaction.controller");

const TransactionRoutes = Router();

/**
 * - Create a new Transaction
 * - POST api transaction
 */
TransactionRoutes.post('/', transactionController.createTransaction)

module.exports = TransactionRoutes;