const User = require('./User')
const bcrypt = require('bcrypt')

const save = async (body) => {
    const hash = await bcrypt.hash(body.password, 10)
    const user = { ...body, password: hash }
    await User.create(user);
}

module.exports = {
    save
}