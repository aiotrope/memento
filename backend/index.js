import app from './app'
import http from 'http'
import variables from './config/variables'
import logger from './utils/logger'

const server = http.createServer(app)

const port = variables.port

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
