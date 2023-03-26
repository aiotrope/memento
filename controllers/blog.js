require('express-async-errors')
const jwt = require('jsonwebtoken')
//const _ = require('lodash')

const variables = require('../util/variables')
const Blog = require('../models').Blog
const User = require('../models').User

const create = async (req, res) => {
  jwt.verify(req.token, variables.jwt_key)

  const currentUser = req.currentUser
  const blog = Blog.build(req.body)
  blog.userId = currentUser.id
  const newBlog = await blog.save()
  res.status(201).json(newBlog)
}

const list = async (req, res) => {
  const blogs = await Blog.findAll({
    raw: true,
    nest: true,
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
  })
  //console.log(JSON.stringify(blogs, null, 2))
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

  if (!blog) throw Error('Blog not found!')
  if (blog.userId !== currentUser.id) throw Error('Unauthorize to update blog!')
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
  if (blog.userId !== currentUser.id) throw Error('Unauthorize to delete blog!')
  const deleteBlog = await Blog.destroy({ where: { id: id } })
  if (deleteBlog) {
    res
      .status(204)
      .json({ message: `${blog.title} by ${blog.author} deleted!` })
  }
}

module.exports = {
  create,
  list,
  retrieve,
  update,
  omit,
}
