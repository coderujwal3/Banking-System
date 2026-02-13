const express = require('express')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser())
app.use(express.json())

/**
 * - Routes
 */
const authRouter = require('./routes/auth.route')
const accountRouter = require("./routes/account.routes")

/**
 * - Use api routes
 */
app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)

module.exports = app