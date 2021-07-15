const express = require('express')
const router = express.Router()
const UserService = require('../user/UserService')
const AuthenticationException = require('./AuthenticationException')
const bcrypt = require('bcrypt')

router.post('/api/1.0/auth', async (req, res, next) => {
    const { email, password } = req.body
    const user = await UserService.findByEmail(email)
    if(!user){
        return next(new AuthenticationException())
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        return next(new AuthenticationException())
    }
    res.send({
        id: user.id,
        username: user.username
    })
})

module.exports = router