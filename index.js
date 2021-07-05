const app = require('./src/app')
const sequelize = require('./src/config/database')
const User = require('./src/user/User')

const addUsers = async (activeUserCount, inactiveUserCount = 0) => {
    const count = activeUserCount + inactiveUserCount
    for (let i = 0; i < count; i++) {
        await User.create({
            username: `user${ i + 1 }`,
            email: `user${ i + 1 }@mail.com`,
            inactive: i >= activeUserCount
        })
    }
}

sequelize.sync({ force: true }).then(async () => {
    await addUsers(25)
})

app.listen(3000, () => console.log('app is running'))
