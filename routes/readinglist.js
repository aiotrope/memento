const express = require('express')

const controllers = require('../controllers/readinglist')

const router = express.Router()

router.get('/', controllers.list)
router.get('/:id', controllers.update)

module.exports = router
