const express = require('express')
const { z } = require('zod')

const controllers = require('../controllers/user')
const middleware = require('../util/middleware')
const regx = require('../util/regex')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor

const router = express.Router()

const signupSchema = z
  .object({
    body: z.object({
      name: z.string().trim().regex(regx.name),
      username: z.string().trim().email(),
      password: z.string().trim().regex(regx.password),
    }),
  })
  .required()
const updateSchema = z
  .object({
    body: z.object({
      name: z.string().trim().regex(regx.name),
      username: z.string().trim().email(),
    }),
  })
  .required()

const loginSchema = z
  .object({
    body: z.object({
      username: z.string().trim().email(),
      password: z.string().trim().regex(regx.password),
    }),
  })
  .required()

router.post('/signup', middleware.validate(signupSchema), controllers.signup)
router.post('/login', middleware.validate(loginSchema), controllers.login)
router.get('/', controllers.list)
router.get('/:id', controllers.retrieve)
router.put(
  '/:username',
  tokenExtractor,
  userExtractor,
  middleware.validate(updateSchema),
  controllers.update
)

module.exports = router
