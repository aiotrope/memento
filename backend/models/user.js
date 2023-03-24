import { DataTypes } from 'sequelize'
import sequelize from './index.js'

//class User extends Model {}

const User = sequelize.define(
  'user',
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
    timestamps: true,
  }
)

export default User
