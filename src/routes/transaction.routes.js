const { Router } = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const TransactionRoutes = Router();

/**
 * - Create a new Transaction
 * - POST api transaction
 */
TransactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createTransaction)

module.exports = TransactionRoutes;