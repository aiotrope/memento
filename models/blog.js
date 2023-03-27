'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      Blog.belongsToMany(models.User, {
        through: 'ReadingList',
        as: 'users',
        foreignKey: 'blogId',
      })
    }
  }
  Blog.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: 4,
            msg: 'Title must be at least 4 characters in length',
          },
        },
      },
      author: { type: DataTypes.STRING, validate: { notEmpty: false } },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: { msg: 'Provide a valid URL' },
        },
      },
      likes: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
      year: {
        type: DataTypes.INTEGER,
        validate: {
          min: { args: 1991, msg: 'Minimum year input starts at 1991' },
          max: {
            args: parseInt(new Date().getFullYear()),
            msg: `Maximum year input is ${parseInt(new Date().getFullYear())}`,
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Blog',
    }
  )
  return Blog
}
