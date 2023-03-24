import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'

//import dbConnection from './utils/db'
import { morganMiddleware } from './utils/logger.js'
import middleware from './utils/middleware.js'
import userRoutes from './routes/user'

const app = express()

app.use(cookieParser())

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cors())

app.use(express.static('build'))

app.use(helmet())

app.use(require('sanitize').middleware)

app.use(morganMiddleware)

app.use('/api/v1/users', userRoutes)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)

export default app
