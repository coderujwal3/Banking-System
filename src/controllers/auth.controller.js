const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken');
const messageService = require('../services/message.service')

/**
* - user register controller
* - POST api/auth/register 
*/
async function userRegisterController(req, res) {
    const { email, name, password, phone } = req.body;
    /**
     * - Formatting the phone number
     * - Only for indian phone numbers
     */
    const formattedPhone = `+91${phone}`;

    const isExists = await userModel.findOne({
        email: email
    })

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with this email",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, name, password, phone: formattedPhone
    })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
    res.cookie("token", token)
    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: formattedPhone,
        }, token
    })

    await messageService.sendRegistrationSMS(user.phone, user.name)
}


/**
* - user login controller
* - POST api/auth/login 
*/
async function userLoginController(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({
            "message": "Invalid email or password",
            "status": "failed"
        })
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        return res.status(401).json({
            "message": "Invalid email or password",
            "status": "failed"
        })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

    res.cookie("token", token)

    res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }, token
    })
}

module.exports = { userRegisterController, userLoginController };