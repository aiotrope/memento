import { Router } from 'express'

import userController from '../controllers/user'

const router = Router()

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/', userController.list)

export default router
