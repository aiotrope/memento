//require('express-async-errors')
const createError = require('http-errors')
const JWT = require('jsonwebtoken')

const { Op } = require('sequelize')
const { z } = require('zod')
const { generateErrorMessage } = require('zod-error')

const schema = require('../util/schema')
const Blog = require('../models').Blog
const User = require('../models').User
const variables = require('../util/variables')

const create = async (req, res, next) => {
  const sess = req.session
  try {
    const response = schema.createBlogSchema.safeParse(req.body)
    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const currentUser = await User.findByPk(sess.authUserId)
    console.log(currentUser)
    if (!currentUser) throw createError.Unauthorized('Login to your account')

    let blog = await Blog.create(req.body)
    // populate ReadingLists join table
    await blog.addUser(currentUser)

    let addedBlog = await Blog.findByPk(blog.id)
    res.status(201).json(addedBlog)
  } catch (error) {
    next(error)
  }
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
  const sess = req.session
  sess.blogs = blogs

  res.status(200).json(blogs)
}

const retrieve = async (req, res, next) => {
  const { id } = req.params
  const blog = await Blog.findByPk(id)

  if (!blog) {
    return next(createError(404, 'Blog not found'))
  }
  console.error(blog)
  res.status(200).json({ blog })

  next()
}

const update = async (req, res, next) => {
  const sess = req.session

  try {
    const blog = await Blog.findByPk(Number(req.params.id))

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

    const currentUser = await User.findByPk(sess.authUserId)

    if (!blog) throw createError.NotFound('Blog not found!')
    if (!currentUser) throw createError.NotFound('User not found!')
    if (blog.users.id !== currentUser.id) {
      throw createError.Forbidden(`Not allowed to update ${blog.title}`)
    }

    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const data = {
      title: response.data.title,
      url: response.data.url,
      author: response.data.author,
      likes: response.likes,
      year: response.data.year,
    }

    const updateBlog = await Blog.update(data, {
      where: { id: req.params.id },
    })
    if (updateBlog) {
      const updatedBlog = await Blog.findOne({ where: { id: req.params.id } })
      res.status(200).json(updatedBlog)
    }
  } catch (error) {
    next(error)
  }
}
const omit = async (req, res, next) => {
  JWT.verify(req.access, variables.jwt_key)
  try {
    const currentUser = req.currentUser
    const blog = await Blog.findByPk(req.params.id)

    if (!blog) throw createError.NotFound('Blog not found!')
    if (blog?.users?.id !== currentUser.id) {
      throw createError.Forbidden(`Not allowed to delete ${blog.title}`)
    }
    const deleteBlog = await Blog.destroy({ where: { id: req.params.id } })
    if (deleteBlog) {
      res
        .status(204)
        .json({ message: `${blog.title} by ${blog.author} deleted!` })
    }
  } catch (error) {
    next(error)
  }
}

const authors = async (req, res, next) => {
  try {
    const response = await Blog.findAll({
      attributes: ['author', 'title', 'likes'],
      group: 'id',
      order: [['likes', 'DESC']],
    })

    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  create,
  list,
  retrieve,
  update,
  omit,
  authors,
}
