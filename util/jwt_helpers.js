const JWT = require('jsonwebtoken')
const createError = require('http-errors')

const variables = require('./variables')
const User = require('../models').User

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {}
    const privateKey = variables.jwt_key
    //console.log(userId)
    const options = {
      expiresIn: '1h',
      issuer: 'arnelimperial.com', // web issuer
      audience: userId.toString(),
    }
    JWT.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        console.error(err.message)
        reject(createError.InternalServerError())
        return
      }
      resolve(token)
    })
  })
}

const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) return next(createError.Unauthorized())
  const authHeader = req.headers['authorization']
  const bearerToken = authHeader.split(' ')
  const token = bearerToken[1]

  JWT.verify(token, variables.jwt_key, async (err, payload) => {
    if (err) {
      const message =
        err.message === 'JsonWebTokenError' ? 'Unauthorized' : err.message
      return next(createError.Unauthorized(message))
    }
    req.payload = payload
    req.access = token
    console.log(payload)
    const currentUser = await User.findByPk(payload.aud)
    if (!currentUser)
      throw createError.Unauthorized('No authenticated user found!')
    req.currentUser = currentUser
    next()
  })
}

const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {}
    const privateKey = variables.jwt_refresh_key
    const options = {
      expiresIn: '30d',
      issuer: 'arnelimperial.com',
      audience: userId.toString(),
    }
    JWT.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        console.error(err.message)
        reject(createError.InternalServerError())
      }
      resolve(token)
    })
  })
}

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    const options = {
      issuer: 'arnelimperial.com',
    }
    JWT.verify(
      refreshToken,
      variables.jwt_refresh_key,
      options,
      (err, payload) => {
        console.log(err)
        if (err) return reject(createError.Unauthorized())
        const userId = payload.aud
        return resolve(userId)
      }
    )
  })
}

const jwt_helpers = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
}

module.exports = jwt_helpers
