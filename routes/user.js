const express = require('express')

const controllers = require('../controllers/user')
const jwt_helpers = require('../util/jwt_helpers')

const router = express.Router()

router.post('/signup', controllers.create)
router.post('/login', controllers.login)
router.get('/', controllers.list)
router.get('/:id', controllers.retrieve)

router.patch('/:username', jwt_helpers.verifyAccessToken, controllers.update)

router.post(
  '/auth-tokens',
  jwt_helpers.verifyAccessToken,
  controllers.requestAuthTokens
)

router.delete('/logout', jwt_helpers.verifyAccessToken, controllers.logout)

module.exports = router
