const express = require('express')
const userRouter = require('../routes/auth.route')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', userRouter)

module.exports = app