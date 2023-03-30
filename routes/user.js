const express = require('express')

const controllers = require('../controllers/user')
//const middleware = require('../util/middleware')
const jwt_helpers = require('../util/jwt_helpers')
/*
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor */
//const jwt_helpers = require('../util/jwt_helpers')
//const authenticatedSession = middleware.authenticatedSession

const router = express.Router()

router.post('/signup', controllers.create)
router.post('/login', controllers.login)
router.get('/', controllers.list)
router.get('/:id', controllers.retrieve)

// routes after this middlewares requires login
//router.use(authenticatedSession)

router.patch('/:username', jwt_helpers.verifyAccessToken, controllers.update)

// route for requesting new auth token + the valid refresh token
router.post(
  '/auth-tokens',
  jwt_helpers.verifyAccessToken,
  controllers.requestAuthTokens
)

router.delete('/logout', jwt_helpers.verifyAccessToken, controllers.logout)

module.exports = router
