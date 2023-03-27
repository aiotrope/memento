const express = require('express')

const controllers = require('../controllers/blog')
const middleware = require('../util/middleware')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor

const router = express.Router()

router.post('/', tokenExtractor, userExtractor, controllers.create)
router.get('/:search?', controllers.list)
router.get('/:id', controllers.retrieve)
router.put('/:id', tokenExtractor, userExtractor, controllers.update)
router.delete('/:id', tokenExtractor, userExtractor, controllers.omit)

module.exports = router
