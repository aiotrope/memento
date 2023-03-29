const express = require('express')

const controllers = require('../controllers/user')
const middleware = require('../util/middleware')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor
const authenticatedSession = middleware.authenticatedSession

const router = express.Router()

router.post('/signup', controllers.create)
router.post('/login', controllers.login)
router.get('/', controllers.list)
router.get('/:id', controllers.retrieve)

// routes after this middlewares requires login
router.use(authenticatedSession)

router.put('/:username', tokenExtractor, userExtractor, controllers.update)

// route for requesting new auth token + the valid refresh token
router.post(
  '/auth-tokens',
  tokenExtractor,
  userExtractor,
  controllers.requestAuthTokens
)

router.delete('/logout', tokenExtractor, userExtractor, controllers.logout)

module.exports = router
