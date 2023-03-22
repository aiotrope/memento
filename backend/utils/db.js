import { Sequelize } from 'sequelize'

import variables from './variables'
import logger from './logger'

let sequelize

if (process.env.NODE_ENV === 'development') {
  sequelize = new Sequelize(variables.database_url_dev)
}

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(variables.database_url)
}

const testDbConnection = async () => {
  try {
    await sequelize.authenticate()
    logger.info('Connection has been established successfully')
  } catch (error) {
    logger.error('Unable to connect to the database:', error)
  }
}

const dbConnection = {
  sequelize,
  testDbConnection,
}

export default dbConnection
