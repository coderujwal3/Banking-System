const { Router } = require('express');
const authMiddleware = require("../middleware/auth.middleware");


const authRouter = Router();

/**
 * - Create a new Transaction
 * - POST api transaction
 */
authRouter.post("/", authMiddleware.authMiddleware)