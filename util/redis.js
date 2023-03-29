const Redis = require('ioredis')
const variables = require('../util/variables')

let redisClient = new Redis(variables.redis_url)

module.exports = redisClient
