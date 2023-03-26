require('express-async-errors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models').User
const Blog = require('../models').Blog
const variables = require('../util/variables')

const signup = async (req, res) => {
  const { name, username, password } = req.body
  const saltRounds = 10

  const user = await User.findOne({ where: { username: username } })
  if (user) throw Error('Cannot use the username provided!')

  const passwordHash = await bcrypt.hash(password, saltRounds)
  const data = {
    username: username,
    name: name,
    passwordHash: passwordHash,
  }
  let newUser = await User.create(data)
  return res.status(201).json(newUser)
}

const login = async (req, res) => {
  const { username, password } = req.body

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
      let token = jwt.sign(userToken, variables.jwt_key, { expiresIn: '1h' })

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
        as: 'blogs',
      },
    ],
  })

  //console.log(JSON.stringify(users, null, 2))
  res.status(200).json(users)
}

const retrieve = async (req, res) => {
  const id = req.params.id
  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: Blog,
        as: 'blogs',
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

  if (!user) throw Error('User not found!')
  if (currentUser.username !== username) {
    throw Error('Unauthorize to update user!')
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
  signup,
  login,
  list,
  retrieve,
  update,
}
