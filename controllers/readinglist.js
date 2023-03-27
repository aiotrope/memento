require('express-async-errors')
const { z } = require('zod')
const { fromZodError } = require('zod-validation-error')
const jwt = require('jsonwebtoken')

const variables = require('../util/variables')
const ReadingList = require('../models').ReadingList

const list = async (req, res) => {
  let search = req.query.search
  if (!search) search = ''
  let blogs = await ReadingList.findAll({
    raw: true,
    nest: true,
    attributes: ['blogId', 'userId'],
    order: [['userId', 'ASC']],
  })

  res.status(200).json(blogs)
}

const update = async (req, res) => {
  jwt.verify(req.token, variables.jwt_key)
  const id = req.params.id
  const currentUser = req.currentUser
  const readingList = await ReadingList.findByPk(id)

  const updateSchema = z.object({
    read: z.boolean().default(true),
  })

  const response = updateSchema.safeParse(req.body)

  if (!readingList) throw Error('Reading list item not found!')
  if (readingList.userId !== currentUser.id) {
    throw Error('Unauthorize to update reading list item!')
  }

  if (!response.success) {
    const validationError = fromZodError(response.error)
    const path = validationError.details.map((e) => e.path)
    const msg = validationError.details.map((e) => e.message)
    res.status(400).json({ error: `${msg[0]} ${path}` })
  }

  const updateReadingList = await ReadingList.update(req.body, {
    where: { id: id },
  })
  if (updateReadingList) {
    const updatedReadingList = await ReadingList.findOne({ where: { id: id } })
    res.status(200).json(updatedReadingList)
  }
}

module.exports = {
  list,
  update,
}
