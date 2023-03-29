const express = require('express')

const controllers = require('../controllers/readinglist')
const middleware = require('../util/middleware')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor
const authenticatedSession = middleware.authenticatedSession

const router = express.Router()

router.get('/', controllers.list)

router.use(authenticatedSession)

router.patch('/:id', tokenExtractor, userExtractor, controllers.update)

module.exports = router
