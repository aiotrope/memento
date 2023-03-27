require('express-async-errors')

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

module.exports = {
  list,
}
