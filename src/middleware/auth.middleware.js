const mongoose = require('mongoose')
const userModel = require('../models/user.model')
const jwt = require("jsonwebtoken")


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // using the same data to show, which was saved when initializing the token in auth.controller.js (e.i, user._id)
        const user = await userModel.findById(decoded_token.userId)
        req.user = user
        return next()

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }
}



module.exports = { authMiddleware }