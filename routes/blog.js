const express = require('express')
const { z } = require('zod')

const controllers = require('../controllers/blog')
const middleware = require('../util/middleware')
const tokenExtractor = middleware.tokenExtractor
const userExtractor = middleware.userExtractor

const router = express.Router()

const createBlogSchema = z.object({
  body: z.object({
    title: z.string().trim().min(4),
    author: z.string().trim().optional().or(z.literal('')),
    url: z.string().trim().url(),
    likes: z.number().nonnegative().default(0),
  }),
})

router.post(
  '/',
  tokenExtractor,
  userExtractor,
  middleware.validate(createBlogSchema),
  controllers.create
)

router.get('/:search?', controllers.list)

router.get('/:id', controllers.retrieve)

router.put(
  '/:id',
  tokenExtractor,
  userExtractor,
  middleware.validate(createBlogSchema),
  controllers.update
)
router.delete('/:id', tokenExtractor, userExtractor, controllers.omit)

module.exports = router