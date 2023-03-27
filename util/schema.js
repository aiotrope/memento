const { z } = require('zod')

const regx = require('../util/regex')

const signupSchema = z.object({
  name: z.string().trim().regex(regx.name),
  username: z.string().trim().email(),
  password: z.string().trim().regex(regx.password),
})

const loginSchema = z.object({
  username: z.string().trim().email(),
  password: z.string().trim().regex(regx.password),
})

const createBlogSchema = z.object({
  title: z.string().trim().min(4),
  author: z.string().trim().optional().or(z.literal('')),
  url: z.string().trim().url(),
  likes: z.number().nonnegative().default(0),
  year: z
    .number()
    .nonnegative()
    .gte(1991)
    .lte(parseInt(new Date().getFullYear())),
})

const schema = {
  signupSchema,
  loginSchema,
  createBlogSchema,
}

module.exports = schema
