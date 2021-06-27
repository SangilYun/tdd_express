const express = require('express')
const UserService = require('./UserService')
const router = express.Router()
const { check, validationResult } = require('express-validator')

router.post('/api/1.0/users',
    check('username')
        .notEmpty().withMessage('username_null').bail()
        .isLength({ min: 4, max: 32 }).withMessage('username_size'),
    check('email')
        .notEmpty().withMessage('email_null').bail()
        .isEmail().withMessage('email_invalid').bail()
        .custom(async (email) => {
            const user = await UserService.findByEmail(email)
            if (user) {
                throw new Error('email_inuse')
            }
        }),
    check('password')
        .notEmpty().withMessage('password_null').bail()
        .isLength({ min: 6 }).withMessage('password_size').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage('password_pattern'),
    // .isStrongPassword({ minLowercase:1, minUppercase:1, minNumbers: 1}).withMessage('Password must have at least 1 uppercase, 1 lowercase letter and 1 number'),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const validationErrors = {}
            errors.array().forEach((error) => (validationErrors[error.param] = req.t(error.msg)))
            return res.status(400).send({ validationErrors })
        }
        try {
            await UserService.save(req.body)
            return res.send({ message: 'User Created' })
        } catch (e) {
            return res.status(502).send({ message: req.t(e.message) })
        }
    })

router.post('/api/1.0/users/token/:token', async (req, res) => {
    const token = req.params.token
    try {
        await UserService.activate(token)
    } catch (e) {
        return res.status(400).send({message: req.t(e.message)})
    }
    res.send({ message: req.t('account_activation_success') })
})

module.exports = router