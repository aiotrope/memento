import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'

//import dbConnection from './utils/db'
import { morganMiddleware } from './utils/logger'
import middleware from './utils/middleware'

const app = express()

app.use(cookieParser())

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cors())

app.use(express.static('build'))

app.use(helmet())

app.use(require('sanitize').middleware)

app.use(morganMiddleware)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)

export default app
