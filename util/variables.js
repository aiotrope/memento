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
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
const REDIS_URL = process.env.REDIS_URL
const COOKIE_SECRET1 = process.env.COOKIE_SECRET1
const COOKIE_SECRET2 = process.env.COOKIE_SECRET2
const COOKIE_NAME = process.env.COOKIE_NAME

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
  jwt_refresh_key: JWT_REFRESH_KEY,
  redis_host: REDIS_HOST,
  redis_port: REDIS_PORT,
  redis_password: REDIS_PASSWORD,
  redis_url: REDIS_URL,
  cookie_secret1: COOKIE_SECRET1,
  cookie_secret2: COOKIE_SECRET2,
  cookie_name: COOKIE_NAME,
}

module.exports = variables
