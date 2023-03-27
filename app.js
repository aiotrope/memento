const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const middleware = require('./util/middleware')

const userRouter = require('./routes/user')
const blogRouter = require('./routes/blog')
const authorRouter = require('./routes/author')

const db = require('./models')

const app = express()

app.use(cookieParser())

app.use(express.json())

app.use(logger('dev'))

app.use(express.urlencoded({ extended: false }))

app.use(cors())

app.use(helmet())

app.use(express.static('build'))

app.use(express.static(path.join(__dirname, 'public')))

db.sequelize.sync({ force: true }).then(() => {
  console.log('db has been re sync')
})

app.use('/api/users', userRouter)

app.use('/api/blogs', blogRouter)

app.use('/api/authors', authorRouter)

app.use(require('sanitize').middleware)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)

module.exports = app
