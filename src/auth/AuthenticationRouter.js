const express = require('express')
const router = express.Router()

const UserService = require('../user/UserService')

router.post('/api/1.0/auth', async (req, res) => {
    const user = await UserService.findByEmail(req.body.email)
    res.send({
        id: user.id,
        username: user.username
    })
})

module.exports = router