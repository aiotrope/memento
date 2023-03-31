const express = require('express')

const controllers = require('../controllers/readinglist')

const jwt_helpers = require('../util/jwt_helpers')

const router = express.Router()

router.get('/', controllers.list)

router.get('/retrieve/:id', controllers.retrieve)

router.patch('/update/:id', jwt_helpers.verifyAccessToken, controllers.update)

module.exports = router
