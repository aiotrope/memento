'use strict'
const { Model } = require('sequelize')
const regx = require('../util/regex')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      User.belongsToMany(models.Blog, {
        through: 'ReadingList',
        as: 'blogs',
        foreignKey: 'userId',
      })
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: regx.name,
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Provide a valid email' },
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  )
  return User
}
