const express = require('express')

const controllers = require('../controllers/blog')

const router = express.Router()

router.get('/', controllers.authors)

module.exports = router
