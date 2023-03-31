const createError = require('http-errors')
const { z } = require('zod')
const { generateErrorMessage } = require('zod-error')

const ReadingList = require('../models').ReadingList
const User = require('../models').User
const schema = require('../util/schema')

const list = async (req, res, next) => {
  try {
    let search = req.query.search
    if (!search) search = ''
    let blogs = await ReadingList.findAll({
      raw: true,
      nest: true,
      attributes: ['blogId', 'userId'],
      order: [['userId', 'ASC']],
    })

    res.status(200).json(blogs)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  const { id } = req.params
  const sess = req.session

  try {
    const currentUser = await User.findByPk(sess.authUserId)
    const readingList = await ReadingList.findByPk(id)

    const updateSchema = z.object({
      read: z.boolean(),
    })

    const response = updateSchema.safeParse(req.body)

    if (!readingList) throw createError.NotFound('Reading list item not found!')
    if (Number(readingList.userId) !== Number(currentUser.id)) {
      throw createError.Forbidden('Unauthorize to update reading list item!')
    }

    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const updateReadingList = await ReadingList.update(req.body, {
      where: { id: id },
    })
    if (updateReadingList) {
      const updatedReadingList = await ReadingList.findOne({
        where: { id: id },
      })
      res.status(200).json(updatedReadingList)
    }
  } catch (error) {
    next(error)
  }
}

const retrieve = async (req, res, next) => {
  const { id } = req.params

  try {
    const reading = await ReadingList.findByPk(id)
    if (!reading) {
      return next(createError(404, 'Blog not found'))
    }
    res.status(200).json(reading)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  list,
  update,
  retrieve,
}
