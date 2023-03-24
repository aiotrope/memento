//require('express-async-errors')
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//import model from '../models'
import User from '../models/user.js'
import variables from '../config/variables.js'

export const signup = async (req, res) => {
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
  const newUser = await User.create(data)
  res.status(201).json(newUser)
}

export const login = async (req, res) => {
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

export const list = async (req, res) => {
  //const users = await User.findAll()
  res.send('Hello')
}

/* const userController = {
  signup,
  login,
}

export default userController
 */
