const express = require('express')

const controllers = require('../controllers/user')

const router = express.Router()

router.post('/signup', controllers.signup)
router.post('/login', controllers.login)
router.get('/list', controllers.list)

module.exports = router
