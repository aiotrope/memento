'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ReadingList extends Model {
    // eslint-disable-next-line no-unused-vars
    static associate(models) {}
  }
  ReadingList.init(
    {
      userId: DataTypes.INTEGER,
      blogId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'ReadingList',
    }
  )
  return ReadingList
}
