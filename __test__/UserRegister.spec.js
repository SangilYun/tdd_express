const request = require('supertest')
const app = require('../src/app')
const User = require('../src/user/User')
const sequelize = require('../src/config/database')

beforeAll(() => {
    return sequelize.sync()
})
beforeEach(() => {
    return User.destroy({ truncate: true })
})

const validUser = {
    username: 'user1',
    email: 'user1@mail.com',
    password: 'P4ssword',
}

const postUser = (user = validUser, options = {}) => {
    const agent = request(app).post('/api/1.0/users');
    if (options.language) {
        agent.set('Accept-Language', options.language)
    }
    return agent.send(user)
}

describe('User Registration', () => {
    it('returns 200 OK when signup request is valid', async () => {
        const response = await postUser()
        expect(response.status).toBe(200)

    })

    it('returns success message when signup request is valid', async () => {
        const response = await postUser()
        expect(response.body.message).toBe('User Created')

    })

    it('saves the user to database', async () => {
        await postUser()
        const userList = await User.findAll()
        expect(userList.length).toBe(1)

    })

    it('saves the username and email to database', async () => {
        await postUser()
        const userList = await User.findAll()
        const savedUser = userList[0]
        expect(savedUser.username).toBe('user1')
        expect(savedUser.email).toBe('user1@mail.com')
    })

    it('hashes the password in database', async () => {
        await postUser()
        const userList = await User.findAll()
        const savedUser = userList[0]
        expect(savedUser.password).not.toBe('P4ssword')
    })

    it('returns 400 when username is null', async () => {
        const response = await postUser({
            username: null,
            email: 'user1@mail.com',
            password: 'P4ssword',
        })
        expect(response.status).toBe(400)
    })

    it('returns validation Errors field in response body when validation error occurs', async () => {
        const response = await postUser({
            username: null,
            email: 'user1@mail.com',
            password: 'P4ssword',
        })
        const body = response.body;
        expect(body.validationErrors).not.toBeUndefined()
    })

    it('returns errors for both when username and email is null', async () => {
        const response = await postUser({
            username: null,
            email: null,
            password: 'P4ssword',
        })
        const body = response.body;
        expect(Object.keys(body.validationErrors)).toEqual([ 'username', 'email' ])
    })

    const username_null = 'Username cannot be null'
    const username_size = 'Must have min 4 and max 32 characters'
    const email_null = 'E-mail cannot be null'
    const email_invalid = 'E-mail is not valid'
    const password_null = 'Password cannot be null'

    const password_size = 'Password must be at least 6 characters'
    const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'
    const email_inuse = 'E-mail in use'

    it.each`
    field           | value                                   | expectedMessage
    ${ 'username' } | ${ null }                               | ${ username_null }
    ${ 'username' } | ${ 'usr' }                              | ${ username_size }
    ${ 'username' } | ${ 'a'.repeat(33) }              | ${ username_size }
    ${ 'email' }    | ${ null }                               | ${ email_null }
    ${ 'email' }    | ${ 'mail.com' }                         | ${ email_invalid }
    ${ 'email' }    | ${ 'user@mail' }                        | ${ email_invalid }
    ${ 'email' }    | ${ 'user@.com' }                        | ${ email_invalid }
    ${ 'password' } | ${ null }                               | ${ password_null }
    ${ 'password' } | ${ 'p4ssw' }                            | ${ password_size }
    ${ 'password' } | ${ 'alllowercase' }                     | ${ password_pattern }
    ${ 'password' } | ${ 'ALLUPPERCASE' }                     | ${ password_pattern }
    ${ 'password' } | ${ '123456789' }                        | ${ password_pattern }
    ${ 'password' } | ${ 'lowerandUPPER' }                    | ${ password_pattern }
    ${ 'password' } | ${ 'lower4nd56789' }                    | ${ password_pattern }
    ${ 'password' } | ${ 'UPPER234234' }                      | ${ password_pattern }
    
    `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
        const user = {
            username: 'user1',
            email: 'user1@mail.com',
            password: 'P4ssword',
        }
        user[field] = value;
        const response = await postUser(user)
        const body = response.body
        expect(body.validationErrors[field]).toBe(expectedMessage)
    })

    it(`returns ${ email_inuse } in use when same email is already in use`, async () => {
        await User.create({ ...validUser })
        const response = await postUser()
        expect(response.body.validationErrors.email).toBe(email_inuse)
    })

    it('returns errors for both username is null and email is in use', async () => {
        await User.create({ ...validUser })
        const response = await postUser({
            username: null,
            email: validUser.email,
            password: 'P4ssword'
        })

        const body = response.body
        expect(Object.keys(body.validationErrors)).toEqual([ 'username', 'email' ])
    })

    it('creates user in inactive mode', async () => {
        await postUser()
        const users = await User.findAll()
        const savedUser = usesr[0]
        expect(savedUser.inactive).toBe(true)
    })
})

describe('internationalization', () => {
    const username_null = 'Username cannot be null in another languages'
    const username_size = 'Must have min 4 and max 32 characters in another languages'
    const email_null = 'E-mail cannot be null in another languages'
    const email_invalid = 'E-mail is not valid in another languages'
    const password_null = 'Password cannot be null in another languages'

    const password_size = 'Password must be at least 6 characters in another languages'
    const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number in another languages'
    const email_inuse = 'E-mail in use in other languages'

    it.each`
        field           | value                                   | expectedMessage
        ${ 'username' } | ${ null }                               | ${ username_null }
        ${ 'username' } | ${ 'usr' }                              | ${ username_size }
        ${ 'username' } | ${ 'a'.repeat(33) }              | ${ username_size }
        ${ 'email' }    | ${ null }                               | ${ email_null }
        ${ 'email' }    | ${ 'mail.com' }                         | ${ email_invalid }
        ${ 'email' }    | ${ 'user@mail' }                        | ${ email_invalid }
        ${ 'email' }    | ${ 'user@.com' }                        | ${ email_invalid }
        ${ 'password' } | ${ null }                               | ${ password_null }
        ${ 'password' } | ${ 'p4ssw' }                            | ${ password_size }
        ${ 'password' } | ${ 'alllowercase' }                     | ${ password_pattern }
        ${ 'password' } | ${ 'ALLUPPERCASE' }                     | ${ password_pattern }
        ${ 'password' } | ${ '123456789' }                        | ${ password_pattern }
        ${ 'password' } | ${ 'lowerandUPPER' }                    | ${ password_pattern }
        ${ 'password' } | ${ 'lower4nd56789' }                    | ${ password_pattern }
        ${ 'password' } | ${ 'UPPER234234' }                      | ${ password_pattern }
        
        `('returns $expectedMessage when $field is $value when language is set in other languages', async ({ field, value, expectedMessage }) => {
        const user = {
            username: 'user1',
            email: 'user1@mail.com',
            password: 'P4ssword',
        }
        user[field] = value;
        const response = await postUser(user, { language: 'ko' })
        const body = response.body
        expect(body.validationErrors[field]).toBe(expectedMessage)
    })

    it(`returns ${ email_inuse } in use when same email is already in use in other languages`, async () => {
        await User.create({ ...validUser })
        const response = await postUser({ ...validUser }, { language: 'ko' })
        expect(response.body.validationErrors.email).toBe(email_inuse)
    })
});
