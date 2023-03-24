import http from 'http'
import app from './app.js'
import variables from './config/variables.js'
import logger from './utils/logger.js'

const server = http.createServer(app)

const port = variables.port

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
