const express = require('express')
const router = express.Router()

const UserService = require('../user/UserService')
const AuthenticationException = require('./AuthenticationException')

router.post('/api/1.0/auth', async (req, res, next) => {
    const user = await UserService.findByEmail(req.body.email)
    if(!user){
        return next(new AuthenticationException())
    }
    res.send({
        id: user.id,
        username: user.username
    })
})

module.exports = router