'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      Blog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      })
    }
  }
  Blog.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      author: DataTypes.STRING,
      url: { type: DataTypes.STRING, allowNull: false },
      userId: DataTypes.INTEGER,
      likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'Blog',
    }
  )
  return Blog
}
