const request = require('supertest')
const app = require('../src/app')
const User = require('../src/user/User')
const sequelize = require('../src/config/database')
const bcyrpt = require('bcrypt')

beforeAll(async () => {
    await sequelize.sync()
})

beforeEach(async() => {
    await User.destroy({ truncate: true})
})

async function addUser() {
    const user = { username: 'user1', email: 'user1@mail.com', password: 'P4ssword', inactive: false }
    user.password = await bcyrpt.hash(user.password, 10)
    await User.create(user)
}

const postAuthentication = async (credentials) => {
    return await request(app).post('/api/1.0/auth').send(credentials)
}

describe('Authentication', () => {
    it('returns 200 when credentials are correct', async () => {
        await addUser()
        const response = await postAuthentication({email: 'user1@mail.com', password:'P4ssword'})
        expect(response.status).toBe(200)
    })
});