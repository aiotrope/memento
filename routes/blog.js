const express = require('express')

const controllers = require('../controllers/blog')

const jwt_helpers = require('../util/jwt_helpers')

const router = express.Router()

router.get('/:search?', controllers.list)
router.get('/blog/:id', controllers.retrieve)

router.post('/', jwt_helpers.verifyAccessToken, controllers.create)
router.put('/update/:id', jwt_helpers.verifyAccessToken, controllers.update)
router.delete('/omit/:id', jwt_helpers.verifyAccessToken, controllers.omit)

module.exports = router
