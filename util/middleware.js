const createError = require('http-errors')
const jwt = require('jsonwebtoken')

const User = require('../models').User
const variables = require('../util/variables')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7)
  } else {
    next(createError(401))
  }
  next()
}

const userExtractor = async (req, res, next) => {
  const token = req.token

  const decoded = jwt.decode(token, variables.jwt_key)

  const currentUser = await User.findByPk(decoded.id)
  if (!currentUser || !token || !decoded) {
    next(createError(401))
  } else if (currentUser || token || decoded) {
    req.currentUser = currentUser

    req.name = currentUser.name

    req.user = decoded
  } else {
    next(createError(401))
  }

  next()
}

const endPoint404 = (_req, _res, next) => {
  next(createError(404))
}

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    next()
  } catch (err) {
    return res.status(400).send(err.errors)
  }
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: `${error.value} is not valid ID!` })
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  if (error.name === 'MongoServerError') {
    return res.status(500).json({
      error: `Name ${req.body.name} cannot be used!`,
    })
  }
  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'UnauthorizedError'
  ) {
    return res
      .status(401)
      .json({ error: 'unauthorize: token maybe incorrect or missing!' })
  }
  if (error.message === 'Cannot use the username provided!') {
    res.status(422).json({ error: error.message })
  }
  if (error.message === 'User not found!') {
    res.status(404).json({ error: error.message })
  }
  if (error.message === 'Blog not found!') {
    res.status(404).json({ error: error.message })
  }

  next(error)
}

const middleware = {
  endPoint404,
  errorHandler,
  validate,
  tokenExtractor,
  userExtractor,
}

module.exports = middleware
