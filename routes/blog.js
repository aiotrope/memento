const express = require('express')

const controllers = require('../controllers/blog')
//const middleware = require('../util/middleware')
//const tokenExtractor = middleware.tokenExtractor
//const userExtractor = middleware.userExtractor */
//const authenticatedSession = middleware.authenticatedSession

const jwt_helpers = require('../util/jwt_helpers')

const router = express.Router()

router.get('/:search?', controllers.list)
router.get('/:id', controllers.retrieve)

//router.use(authenticatedSession)

router.post('/', jwt_helpers.verifyAccessToken, controllers.create)
router.put('/:id', jwt_helpers.verifyAccessToken, controllers.update)
router.delete('/:id', jwt_helpers.verifyAccessToken, controllers.omit)

module.exports = router
