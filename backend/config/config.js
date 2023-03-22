import variables from '../utils/variables'

export default {
  development: {
    username: variables.db_username,
    password: variables.db_password,
    database: variables.db_name,
    host: variables.db_host,
    dialect: 'postgres',
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
}

// sequelize model:generate --name User --attributes name:string,username:string,password:string