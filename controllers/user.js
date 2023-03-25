require('express-async-errors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const models = require('../models')

const variables = require('../config/variables')

const signup = async (req, res) => {
  const { name, username, password } = req.body
  const saltRounds = 10

  const user = await models.User.findOne({ where: { username: username } })
  if (user) throw Error('Cannot use the username provided!')

  const passwordHash = await bcrypt.hash(password, saltRounds)
  const data = {
    username: username,
    name: name,
    passwordHash: passwordHash,
  }
  let newUser = await models.User.create(data)
  return res.status(201).json(newUser)
}

const login = async (req, res) => {
  const { username, password } = req.body

  const user = await models.User.findOne({
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
  const users = await models.User.findAll({ raw: true, nest: true })

  console.log(JSON.stringify(users, null, 2))
  res.status(200).json(users)
}

module.exports = {
  signup,
  login,
  list,
}
