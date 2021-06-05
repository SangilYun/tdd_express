const express = require('express')
const UserService = require('./UserService')
const router = express.Router()
const { check, validationResult } = require('express-validator')

router.post('/api/1.0/users',
    check('username')
        .notEmpty().withMessage('Username cannot be null').bail()
        .isLength({ min: 4, max: 32 }).withMessage('Must have min 4 and max 32 characters'),
    check('email')
        .notEmpty().withMessage('E-mail cannot be null').bail()
        .isEmail().withMessage('E-mail is not valid'),
    check('password').notEmpty().withMessage('Password cannot be null'),

    async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const validationErrors = {}
        errors.array().forEach((error) => (validationErrors[error.param] = error.msg))
        return res.status(400).send({ validationErrors })
    }

    await UserService.save(req.body)
    return res.send({ message: 'User Created' })
})

module.exports = router