import createHttpError from 'http-errors'
import logger from './logger.js'

const endPoint404 = (_req, _res, next) => {
  next(createHttpError(404))
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

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
  if (error.message === 'Cannot use the username provided!') {
    res.status(422).json({ error: error.message })
  }

  next(error)
}

const middleware = {
  endPoint404,
  errorHandler,
}

export default middleware
