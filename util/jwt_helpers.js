const JWT = require('jsonwebtoken')
const createError = require('http-errors')

const variables = require('./variables')
const redisClient = require('../util/redis')
//const User = require('../models').User

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

      const decode = JWT.decode(token, privateKey)
      //console.log(decode)
      const tokenKey = `TOKEN_${userId}`
      redisClient.set(tokenKey, token)
      redisClient.expireat(tokenKey, decode.exp) // 1 hr. exp

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
    /*  console.log(payload)
    const currentUser = await User.findByPk(Number(payload.aud))
    if (!currentUser) throw createError.NotFound('User not found')
    req.currentUser = currentUser */
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

      const refreshTokenKey = `REFRESH-TOKEN_${userId}`
      const decode = JWT.decode(token, privateKey)

      // expire at 30 d.
      redisClient.set(
        refreshTokenKey,
        token,
        'EXAT',
        decode.exp,
        (err, reply) => {
          if (!reply && err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          resolve(token)
        }
      )
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
        const refreshTokenKey = `REFRESH-TOKEN_${userId}`
        redisClient.get(refreshTokenKey, (err, result) => {
          if (err) {
            console.log(err)
            reject(createError.InternalServerError())
            return
          }
          if (refreshToken === result) return resolve(userId)
          reject(createError.Unauthorized())
        })
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
