const { z } = require('zod')

const regx = require('../util/regex')

const options = {
  delimiter: {
    error: ' 🔥 ',
  },
  transform: ({ errorMessage }) => `${errorMessage}`,
}

const signupSchema = z.object({
  name: z.string().trim().regex(regx.name),
  username: z.string().trim().email(),
  password: z.string().trim().regex(regx.password),
})

const signupStaffSchema = z.object({
  name: z.string().trim().regex(regx.name),
  username: z.string().trim().email(),
  password: z.string().trim().regex(regx.password),
  admin: z.boolean().default(true),
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
  options,
  signupStaffSchema,
}

module.exports = schema
