const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const nocache = require('nocache')
const session = require('express-session')

const middleware = require('./util/middleware')
const variables = require('./util/variables')
const userRouter = require('./routes/user')
const blogRouter = require('./routes/blog')
const authorRouter = require('./routes/author')
const readinglistRouter = require('./routes/readinglist')

const app = express()

// if run behind a proxy (e.g. nginx)
// app.set('trust proxy', 1);

const db = require('./models')

app.use(cookieParser())

app.use(express.json())

app.use(logger('dev'))

app.use(express.urlencoded({ extended: false }))

app.use(
  cors({
    origin: ['http://localhost:3000'],
  })
)

app.disable('x-powered-by')

app.use(helmet())

app.use(nocache())

app.use(
  session({
    store: new (require('connect-pg-simple')(session))({
      createTableIfMissing: true,
    }),
    secret: [variables.cookie_secret1, variables.cookie_secret2],
    name: variables.cookie_name,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production' ? true : false, // if true only transmit cookie over https
      httpOnly: false, // if true prevent client side JS from reading the cookie
      maxAge: 1000 * 60 * 600, // session max age in miliseconds (1 hr)
      sameSite: 'lax',
    },
  })
)

app.use(express.static('build'))

app.use(express.static(path.join(__dirname, 'public')))

db.sequelize.sync({ force: true }).then(() => {
  console.log('db has been re sync')
})

app.use('/api/users', userRouter)

app.use('/api/blogs', blogRouter)

app.use('/api/authors', authorRouter)

app.use('/api/readinglists', readinglistRouter)

app.use(require('sanitize').middleware)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)

module.exports = app
