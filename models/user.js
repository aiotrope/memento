'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      User.hasMany(models.Blog, {
        foreignKey: 'userId',
        as: 'blogs',
        onDelete: 'CASCADE',
      })
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?$/gm,
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm,
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
