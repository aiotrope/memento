var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
//const db = require('./models')

var userRouter = require('./routes/user')

var app = express()

/* db.sequelize.sync({ force: true }).then(() => {
  console.log('db has been re sync')
}) */

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1/users', userRouter)

module.exports = app
