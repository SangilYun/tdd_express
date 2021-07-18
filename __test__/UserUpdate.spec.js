const request = require('supertest')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/user/User')
const sequelize = require('../src/config/database')
const bcyrpt = require('bcrypt')
const en = require('../locales/en/translation.json')
const ko = require('../locales/ko/translation.json')

beforeAll(async () => {
    await sequelize.sync()
})

beforeEach(async () => {
    await User.destroy({ truncate: true })
})

const putUser = (id = 5, body = null, options = {}) => {
    const agent = request(app).put('/api/1.0/users/' + id)
    if (options.language) {
        agent.set('Accept-Language', options.language)
    }
    if (options.auth) {
        const { email, password } = options.auth
        // const merged = `${email}: ${password}`
        // const base64 = Buffer.from(merged).toString('base64')
        // agent.set('Authorization', `Basic ${base64}`)
        // the library does above for us
        agent.auth(email, password)
    }
    return agent.send(body)
}

const activeUser = { username: 'user1', email: 'user1@mail.com', password: 'P4ssword', inactive: false }

const addUser = async (user = { ...activeUser }) => {
    user.password = await bcyrpt.hash(user.password, 10)
    return await User.create(user)
}

describe('User Update', () => {
    it('returns forbidden when request sent without basic authorization', async () => {
        const response = await putUser()
        expect(response.status).toBe(403)
    })

    it.each`
    language | message
    ${ 'ko' } | ${ ko.unauthorized_user_update }
    ${ 'en' } | ${ en.unauthorized_user_update }
    `('returns error body with $message for unauthorized request when language is $language', async ({ language, message }) => {
        const nowInMillis = new Date().getTime()
        const response = await putUser(5, null, { language })
        expect(response.body.path).toBe('/api/1.0/users/5')
        expect(response.body.timestamp).toBeGreaterThan(nowInMillis)
        expect(response.body.message).toBe(message)
    })

    it('returns forbidden when request sent with incorrect email in basic authorization', async () => {
        await addUser()
        const response = await putUser(5, null, { auth: { email: 'user1000@mail.com', password: 'P4ssword' } })
        expect(response.status).toBe(403)
    })
    it('returns forbidden when request sent with incorrect password in basic authorization', async () => {
        await addUser()
        const response = await putUser(5, null, { auth: { email: 'user1@mail.com', password: 'password' } })
        expect(response.status).toBe(403)
    })
    it('returns forbidden when update request is sent with correct credentials but for differen user', async () => {
        await addUser()
        const userToBeUpdated = await addUser({ ...activeUser, username: 'user2', email: 'user2@mail.com' })
        const response = await putUser(userToBeUpdated.id, null, { auth: { email: 'user1@mail.com', password: 'P4ssword' } })
        expect(response.status).toBe(403)
    })
    it('returns forbidden when update request is sent by inactive user with correct credentials for its own user', async () => {
        const inactiveUser = await addUser({ ...activeUser, inactive: true })
        const response = await putUser(inactiveUser.id, null, { auth: { email: 'user1@mail.com', password: 'P4ssword' } })
        expect(response.status).toBe(403)
    })
});