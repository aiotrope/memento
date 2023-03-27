const express = require('express')

const controllers = require('../controllers/readinglist')

const router = express.Router()

router.get('/', controllers.list)

module.exports = router
