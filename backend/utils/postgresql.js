import { Sequelize } from 'sequelize'

import variables from '../config/variables'
import logger from './logger'

let sequelize

if (process.env.NODE_ENV === 'development') {
  sequelize = new Sequelize(variables.database_url_dev)
} else if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize(variables.database_url)
} else {
  sequelize = new Sequelize(variables.database_url)
}

try {
  await sequelize.authenticate()
  logger.info('Connection has been established successfully')
} catch (error) {
  logger.error('Unable to connect to the database:', error)
}

const postgresqlDB = {}
postgresqlDB.sequelize = sequelize
postgresqlDB.Sequelize = Sequelize

export default postgresqlDB
