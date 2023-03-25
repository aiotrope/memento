require('express-async-errors')
const jwt = require('jsonwebtoken')

const variables = require('../util/variables')
const Blog = require('../models').Blog

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
  })

  //console.log(JSON.stringify(blogs, null, 2))
  res.status(200).json(blogs)
}

const retrieve = async (req, res) => {
  const id = req.params.id
  const blog = await Blog.findByPk(id)
  if (!blog) throw Error('Blog not found!')
  res.status(200).json(blog)
}

module.exports = {
  create,
  list,
  retrieve,
}
