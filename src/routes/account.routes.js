const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")


const router = express.Router()

/**
 * - POST /api/accounts/
 * - create a new account
 * - Protected Route using token
*/
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route using token
*/
router.get('/', authMiddleware.authMiddleware, accountController.getAllAccountsController)


/**
 * - GET /api/accounts/balance/:accountId
 * - Protected Route using token
*/
router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getBalanceController)

module.exports = router;