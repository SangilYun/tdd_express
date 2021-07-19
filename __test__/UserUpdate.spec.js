const request = require('supertest')
const app = require('../src/app')
const User = require('../src/user/User')
const sequelize = require('../src/config/database')
const bcrypt = require('bcrypt')
const en = require('../locales/en/translation.json')
const ko = require('../locales/ko/translation.json')

beforeAll(async () => {
    await sequelize.sync()
})

beforeEach(async () => {
    await User.destroy({ truncate: true })
})

const putUser = async (id = 5, body = null, options = {}) => {
    let agent = request(app)
    let token
    if (options.auth) {
        const response = await agent.post('/api/1.0/auth').send(options.auth)
        token = response.body.token
    }
    agent = request(app).put('/api/1.0/users/' + id)
    if (options.language) {
        agent.set('Accept-Language', options.language)
    }
    if(token){
        agent.set('Authorization', `Bearer ${token}`)
    }
    return agent.send(body)
}

const activeUser = { username: 'user1', email: 'user1@mail.com', password: 'P4ssword', inactive: false }

const addUser = async (user = { ...activeUser }) => {
    user.password = await bcrypt.hash(user.password, 10)
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
    it('returns forbidden when update request is sent with correct credentials but for different user', async () => {
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
    it('returns 200 ok when valid update request sent from authorised user', async () => {
        const savedUser = await addUser()
        const validUpdate = { username: 'user1-updated' }
        const response = await putUser(savedUser.id, validUpdate, { auth: { email: savedUser.email, password: 'P4ssword' } })
        expect(response.status).toBe(200)
    })
    it('updates username in database when valid update request is sent from authorised user', async () => {
        const savedUser = await addUser()
        const validUpdate = { username: 'user1-updated' }
        await putUser(savedUser.id, validUpdate, { auth: { email: savedUser.email, password: 'P4ssword' } })
        const userInDB = await User.findOne({ where: { id: savedUser.id }})
        expect(userInDB.username).toBe(validUpdate.username)
    })
    it('returns 403 when token is not valid', () => {

    })
});