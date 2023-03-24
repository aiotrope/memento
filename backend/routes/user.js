import express from 'express'

//import userController from '../controllers/user.js'
import { signup, login, list } from '../controllers/user'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/', list)

export default router
