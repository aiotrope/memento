import Sequelize from 'sequelize'
import variables from '../config/variables.js'
import logger from '../utils/logger.js'

let sequelize

if (process.env === 'development') {
  sequelize = new Sequelize(variables.database_url_dev, { dialect: 'postgres' })
} else if (process.env === 'test') {
  sequelize = new Sequelize(variables.database_url_test, {
    dialect: 'postgres',
  })
} else {
  sequelize = new Sequelize(variables.database_url, { dialect: 'postgres' })
}

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.')
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err)
  })

export default sequelize
