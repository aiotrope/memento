const createError = require('http-errors')
const jwt = require('jsonwebtoken')

const User = require('../models').User
const variables = require('../util/variables')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.access = authorization.substring(7)
  } else {
    next(createError(401))
  }
  next()
}

const userExtractor = async (req, res, next) => {
  const token = req.access

  try {
    const decoded = jwt.verify(token, variables.jwt_key)
    //console.log(decoded)

    const currentUser = await User.findByPk(decoded.id)

    if (!currentUser || !token || !decoded) {
      next(createError(401))
    } else if (currentUser || token || decoded) {
      req.currentUser = currentUser
      req.name = currentUser.name
      req.user = decoded
      req.tokenExp = decoded.exp
    } else {
      next(createError(401))
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(createError(403))
    }
  }

  next()
}

const authenticatedSession = (req, res, next) => {
  if (!req.session) {
    next(createError(401))
  }
  next()
}

const endPoint404 = (req, res, next) => {
  next(createError.NotFound())
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  res.status(error.status || 500)
  res.send({
    error: {
      status: error.status || 500,
      error: error.message,
    },
  })

  next(error)
}

const middleware = {
  endPoint404,
  errorHandler,
  tokenExtractor,
  userExtractor,
  authenticatedSession,
}

module.exports = middleware
