require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
const DATABASE_URL_DEV = process.env.DATABASE_URL_DEV
const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST
const DB_HOST = process.env.DB_HOST
const DB_USERNAME = process.env.DB_USERNAME
const DB_NAME = process.env.DB_NAME
const DB_PASSWORD = process.env.DB_PASSWORD
const PORT = process.env.PORT
const JWT_KEY = process.env.JWT_KEY

const variables = {
  database_url: DATABASE_URL,
  database_url_dev: DATABASE_URL_DEV,
  database_url_test: DATABASE_URL_TEST,
  db_host: DB_HOST,
  db_username: DB_USERNAME,
  db_password: DB_PASSWORD,
  db_name: DB_NAME,
  port: PORT,
  jwt_key: JWT_KEY,
}

module.exports = variables
