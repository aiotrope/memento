require('express-async-errors')
const { z } = require('zod')
const { fromZodError } = require('zod-validation-error')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models').User
const Blog = require('../models').Blog
const variables = require('../util/variables')
const schema = require('../util/schema')
const regx = require('../util/regex')
const redisClient = require('../util/redis')

const create = async (req, res) => {
  const { name, username, password } = req.body
  const saltRounds = 10

  const user = await User.findOne({ where: { username: username } })
  const response = schema.signupSchema.safeParse(req.body)
  if (user) throw Error('Cannot use the username provided!')
  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const passwordHash = await bcrypt.hash(password, saltRounds)
  const data = {
    username: username,
    name: name,
    passwordHash: passwordHash,
  }
  let newUser = User.build(data)
  await newUser.save()
  let findUser = await User.findByPk(newUser.id, {
    attributes: { exclude: ['passwordHash'] },
  })
  res.status(201).json(findUser)
}

const login = async (req, res) => {
  const { username, password } = req.body

  const response = schema.loginSchema.safeParse(req.body)
  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const user = await User.findOne({
    where: { username: username },
  })

  if (user) {
    const passwordVerified = await bcrypt.compare(password, user.passwordHash)
    if (passwordVerified) {
      const userToken = {
        username: user.username,
        id: user.id,
      }
      let token = jwt.sign(userToken, variables.jwt_key, {
        expiresIn: '1h',
      })
      let tokenKey = `TOKEN_${user.id}`
      await redisClient.set(tokenKey, token, 'EX', 60 * 60) // 1 hr. exp

      let refreshToken = jwt.sign(userToken, variables.jwt_refresh_key, {
        expiresIn: '30d',
      })
      let refreshTokenKey = `REFRESH-TOKEN_${user.id}`
      await redisClient.set(
        refreshTokenKey,
        refreshToken,
        'EX',
        24 * 60 * 60 * 30 //  30 days exp
      )

      const decode = jwt.decode(token, variables.jwt_key)

      const id = decode.id

      req.session.username = user.username
      req.session.password = password

      res.status(200).json({
        message: 'login successful',
        username: user.username,
        name: user.name,
        id: id,
        token: token,
        refreshToken: refreshToken,
      })
    }
  }
}

const list = async (req, res) => {
  const users = await User.findAll({
    raw: true,
    nest: true,
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: Blog,
        as: 'readings',
      },
    ],
    order: [['createdAt', 'DESC']],
  })

  res.status(200).json(users)
}

const retrieve = async (req, res) => {
  const id = req.params.id
  const user = await User.findByPk(id, {
    attributes: { exclude: ['id', 'passwordHash', 'createdAt', 'updatedAt'] },
    include: [
      {
        model: Blog,
        as: 'readings',
        attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
        through: {
          attributes: {
            exclude: ['userId', 'blogId', 'createdAt', 'updatedAt'],
          },
        },
      },
    ],
  })
  if (!user) throw Error('User not found!')
  res.status(200).json(user)
}
const update = async (req, res) => {
  const username = req.params.username
  const currentUser = req.currentUser
  const user = await User.findOne({ where: { username: username } })
  const updateSchema = z.object({
    name: z.string().trim().regex(regx.name).default(user.name),
    username: z.string().trim().email().default(user.email),
  })
  const response = updateSchema.safeParse(req.body)

  if (!user) throw Error('User not found!')
  if (currentUser.username !== username) {
    throw Error('Unauthorize to update user!')
  }
  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const updateUser = await User.update(req.body, {
    where: { username: username },
  })

  if (updateUser) {
    const updatedUser = await User.findOne({ where: { username: username } })
    res.status(200).json(updatedUser)
  }
}

const requestAuthTokens = async (req, res) => {
  const { currentUser } = req
  const { refresh } = req.body

  const refreshTokenKey = `REFRESH-TOKEN_${currentUser.id}`

  const refreshTokenOnDB = await redisClient.get(refreshTokenKey)
  if (!refreshTokenOnDB) throw Error('Refresh token missing on cache!')
  if (!refresh) throw Error('Refresh token not provided!')
  if (refresh !== refreshTokenOnDB) throw Error('Refresh token is incorrect!')

  jwt.verify(refreshTokenOnDB, variables.jwt_refresh_key, (err, user) => {
    if (err) {
      res.status(403).json({ error: `Login to your account: ${err}` })
    }

    const userToken = {
      username: user.username,
      id: user.id,
    }

    let token = jwt.sign(userToken, variables.jwt_key, {
      expiresIn: '1h',
    })

    let tokenKey = `TOKEN_${user.id}`
    redisClient.set(tokenKey, token, 'EX', 60 * 60)

    res.status(201).json({
      token: token,
      refreshToken: refreshTokenOnDB,
    })
  })
}

const logout = async (req, res) => {
  const { user } = req

  /* const token_key = `BL_TOKEN_${user.id}`
  await redisClient.set(token_key, token)
  await redisClient.expireat(token_key, tokenExp)
  await redisClient.del(`REFRESH-TOKEN_${user.id}`) */

  if (req.session) {
    let tokenKey = `TOKEN_${user.id}`
    await redisClient.del(tokenKey)
    req.session.destroy()
    res.status(200).json({ message: `${user.username} logout successfully!` })
  }
}

module.exports = {
  create,
  login,
  list,
  retrieve,
  update,
  requestAuthTokens,
  logout,
}
