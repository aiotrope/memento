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

      const decode = jwt.decode(token, variables.jwt_key)

      const id = decode.id

      res.status(200).json({
        message: 'login successful',
        token: token,
        username: user.username,
        name: user.name,
        id: id,
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

module.exports = {
  create,
  login,
  list,
  retrieve,
  update,
}
