const createError = require('http-errors')
const { Op } = require('sequelize')
const { generateErrorMessage } = require('zod-error')

const schema = require('../util/schema')
const Blog = require('../models').Blog
const User = require('../models').User

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

  res.status(200).json(blogs)
}

const retrieve = async (req, res, next) => {
  const { id } = req.params

  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: { exclude: ['passwordHash'] },
        },
      ],
    })
    if (!blog) {
      return next(createError(404, 'Blog not found'))
    }
    res.status(200).json(blog)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  const sess = req.session
  const { id } = req.params

  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: { exclude: ['passwordHash'] },
        },
      ],
    })

    const response = schema.createBlogSchema.safeParse(req.body)
    const currentUser = await User.findByPk(sess.authUserId)

    if (!blog) throw createError.NotFound('Blog not found!')
    if (!currentUser) throw createError.Unauthorized('Auth user not found!')
    const blogUserId = blog?.users?.map((b) => b.id)
    if (Number(blogUserId) !== Number(currentUser.id)) {
      throw createError.Forbidden(`Not allowed to update ${blog.title}`)
    }

    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const updateBlog = await Blog.update(req.body, {
      where: { id: id },
    })
    if (updateBlog) {
      const updatedBlog = await Blog.findOne({ where: { id: id } })
      res.status(200).json(updatedBlog)
    }
  } catch (error) {
    next(error)
  }
}

const omit = async (req, res, next) => {
  const sess = req.session
  const { id } = req.params
  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: { exclude: ['passwordHash'] },
        },
      ],
    })

    const currentUser = await User.findByPk(sess.authUserId)
    const blogUserId = blog?.users?.map((b) => b.id)

    if (!blog) throw createError.NotFound('Blog not found!')
    if (!currentUser) throw createError.Unauthorized('Auth user not found!')
    if (Number(blogUserId) !== Number(currentUser.id)) {
      throw createError.Forbidden(`Not allowed to delete ${blog.title}`)
    }
    const deleteBlog = await Blog.destroy({ where: { id: id } })
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
