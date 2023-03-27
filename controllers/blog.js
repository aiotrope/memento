require('express-async-errors')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { fromZodError } = require('zod-validation-error')

const variables = require('../util/variables')
const schema = require('../util/schema')
const Blog = require('../models').Blog
const User = require('../models').User

const create = async (req, res) => {
  jwt.verify(req.token, variables.jwt_key)
  const response = schema.createBlogSchema.safeParse(req.body)
  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const currentUser = req.currentUser
  let blog = await Blog.create(req.body)
  //populate ReadingLists join table
  await blog.addUser(currentUser)

  let findBlog = await Blog.findByPk(blog.id)
  res.status(201).json(findBlog)
}

const list = async (req, res) => {
  let search = req.query.search
  if (!search) search = ''
  let blogs = await Blog.findAll({
    raw: true,
    nest: true,
    include: [
      {
        model: User,
        as: 'users',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
    where: {
      [Op.or]: [
        { title: { [Op.iLike]: '%' + search + '%' } },
        { author: { [Op.iLike]: '%' + search + '%' } },
      ],
    },
    order: [['likes', 'DESC']],
  })

  res.status(200).json(blogs)
}

const retrieve = async (req, res) => {
  const id = req.params.id
  console.log(typeof id)
  const blog = await Blog.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
  })
  if (!blog) throw Error('Blog not found!')
  res.status(200).json(blog)
}

const update = async (req, res) => {
  jwt.verify(req.token, variables.jwt_key)
  const id = req.params.id
  const currentUser = req.currentUser
  const blog = await Blog.findByPk(id)

  const updateSchema = z.object({
    title: z.string().trim().min(4).default(blog.title),
    author: z.string().trim().default(blog.author),
    url: z.string().trim().url().default(blog.url),
    likes: z.number().nonnegative().default(blog.likes),
    year: z
      .number()
      .nonnegative()
      .gte(1991)
      .lte(parseInt(new Date().getFullYear()))
      .default(blog.year),
  })

  const response = updateSchema.safeParse(req.body)

  if (!blog) throw Error('Blog not found!')
  if (blog.users.id !== currentUser.id) {
    throw Error('Unauthorize to update blog!')
  }

  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const updateBlog = await Blog.update(req.body, { where: { id: id } })
  if (updateBlog) {
    const updatedBlog = await Blog.findOne({ where: { id: id } })
    res.status(200).json(updatedBlog)
  }
}
const omit = async (req, res) => {
  jwt.verify(req.token, variables.jwt_key)
  const id = req.params.id
  const currentUser = req.currentUser
  const blog = await Blog.findByPk(id)

  if (!blog) throw Error('Blog not found!')
  if (blog.users.id !== currentUser.id) {
    throw Error('Unauthorize to delete blog!')
  }
  const deleteBlog = await Blog.destroy({ where: { id: id } })
  if (deleteBlog) {
    res
      .status(204)
      .json({ message: `${blog.title} by ${blog.author} deleted!` })
  }
}

const authors = async (req, res) => {
  const response = await Blog.findAll({
    attributes: ['author', 'title', 'likes'],
    group: 'id',
    order: [['likes', 'DESC']],
  })

  res.status(200).json(response)
}

module.exports = {
  create,
  list,
  retrieve,
  update,
  omit,
  authors,
}
