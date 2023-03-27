const express = require('express')

const controllers = require('../controllers/user')
const middleware = require('../util/middleware')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor

const router = express.Router()

router.post('/signup', controllers.create)
router.post('/login', controllers.login)
router.get('/', controllers.list)
router.get('/:id', controllers.retrieve)
router.put('/:username', tokenExtractor, userExtractor, controllers.update)

module.exports = router
