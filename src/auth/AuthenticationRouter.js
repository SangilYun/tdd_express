const express = require('express')
const router = express.Router()
const UserService = require('../user/UserService')
const AuthenticationException = require('./AuthenticationException')
const ForbiddenException = require('../error/ForbiddenException')
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')

router.post('/api/1.0/auth',
    check('email').isEmail(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return next(new AuthenticationException())
        }
        const { email, password } = req.body
        const user = await UserService.findByEmail(email)
        if (!user) {
            return next(new AuthenticationException())
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return next(new AuthenticationException())
        }
        if (user.inactive) {
            return next(new ForbiddenException())
        }
        res.send({
            id: user.id,
            username: user.username
        })
    })

module.exports = router