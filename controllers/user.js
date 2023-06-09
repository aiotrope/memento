const createError = require('http-errors')
const { z } = require('zod')
const { generateErrorMessage } = require('zod-error')
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models').User
const Blog = require('../models').Blog
const variables = require('../util/variables')
const schema = require('../util/schema')
const jwt_helpers = require('../util/jwt_helpers')

const create = async (req, res, next) => {
  const { name, username, password } = req.body
  const saltRounds = 10

  try {
    const userExist = await User.findOne({ where: { username: username } })
    const response = schema.signupSchema.safeParse(req.body)
    if (userExist)
      throw createError.Conflict('Cannot use the username provided!')
    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const passwordHash = await bcrypt.hash(password, saltRounds)
    const data = {
      username: username,
      name: name,
      passwordHash: passwordHash,
    }
    let newUser = User.build(data)
    await newUser.save()
    let findUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ['passwordHash'] },
    })
    res.status(201).json(findUser)
  } catch (error) {
    next(error)
  }
}

const createStaff = async (req, res, next) => {
  const { username } = req.body
  const saltRounds = 10

  try {
    const userExist = await User.findOne({ where: { username: username } })
    const response = schema.signupStaffSchema.safeParse(req.body)
    if (userExist)
      throw createError.Conflict('Cannot use the username provided!')
    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    const passwordHash = await bcrypt.hash(response.data.password, saltRounds)
    const data = {
      username: response.data.username,
      name: response.data.name,
      passwordHash: passwordHash,
      admin: response.data.admin,
    }
    let newUser = await User.create(data)

    let findUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ['passwordHash'] },
    })
    res.status(201).json(findUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  const { username, password } = req.body

  try {
    const response = schema.loginSchema.safeParse(req.body)

    const user = await User.findOne({
      where: { username: username },
    })

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }

    if (!user) throw createError.NotFound(`No account for ${username}`)

    if (!passwordMatch)
      throw createError.Unauthorized('Incorrect login credentials')

    if (user.disabled) {
      throw createError.Unauthorized('Account disabled, please contact admin')
    }

    const accessToken = await jwt_helpers.signAccessToken(user.id)
    const refreshToken = await jwt_helpers.signRefreshToken(user.id)

    const decode = JWT.decode(accessToken, variables.jwt_key)

    const id = Number(decode.aud)

    // init session parameters
    const sess = req.session
    sess.username = user.username
    sess.password = password
    sess.access = accessToken
    sess.refresh = refreshToken
    sess.authUserId = id

    res.status(200).json({
      message: 'login successful',
      username: user.username,
      name: user.name,
      id: id,
      access: accessToken,
      refresh: refreshToken,
    })
  } catch (error) {
    next(error)
  }
}

const list = async (req, res, next) => {
  try {
    const users = await User.findAll({
      raw: true,
      nest: true,
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Blog,
          as: 'readings',
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

const retrieve = async (req, res, next) => {
  const id = req.params.id
  let { read } = req.query
  let user

  try {
    if (!read) {
      user = await User.findByPk(id, {
        attributes: {
          exclude: ['id', 'passwordHash', 'createdAt', 'updatedAt'],
        },
        include: [
          {
            model: Blog,
            as: 'readings',
            attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
          },
        ],
      })

      if (!user) {
        return next(createError(404, 'User not found'))
      }
      res.status(200).json(user)
    }
    user = await User.findByPk(id, {
      attributes: { exclude: ['id', 'passwordHash', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: Blog,
          as: 'readings',
          attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
          through: { where: { read: read } },
        },
      ],
    })
    if (!user) {
      return next(createError(404, 'User not found'))
    }
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { username } = req.params
    const sess = req.session
    const user = await User.findOne({ where: { username: username } })

    if (!user) throw createError.NotFound(`No account for ${username}`)
    if (sess.username !== username) {
      throw createError.Forbidden(`Not allowed to edit user: ${sess.username}`)
    }
    if (!sess) throw createError.Unauthorized('Login to your account')

    const passwordMatch = await bcrypt.compare(sess.password, user.passwordHash)

    if (!passwordMatch)
      throw createError.UnprocessableEntity('Credential and session mismatch')

    const response = schema.signupSchema.safeParse(req.body)

    if (!response.success) {
      const errorMessage = generateErrorMessage(
        response.error.issues,
        schema.options
      )
      throw createError.BadRequest(errorMessage)
    }
    //console.log(response)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(response.data.password, saltRounds)
    const data = {
      username: response.data.username,
      name: response.data.name,
      passwordHash: passwordHash,
    }

    const updateUser = await User.update(data, {
      where: { username: username },
    })

    if (updateUser) {
      sess.username = response.data.username
      sess.password = response.data.password

      const updatedUser = await User.findOne({
        where: { username: response.data.username },
        attributes: {
          exclude: ['passwordHash'],
        },
      })

      res.status(200).json(updatedUser)
    }
  } catch (error) {
    next(error)
  }
}

const requestAuthTokens = async (req, res) => {
  const { refresh } = req.body
  const sess = req.session

  const refreshTokenOnSession = await sess.refresh
  if (!refreshTokenOnSession)
    throw createError.Unauthorized('Refresh token missing on cache!')
  if (!refresh) throw createError.BadRequest('Refresh token not provided!')
  if (refresh !== refreshTokenOnSession)
    throw createError.Unauthorized('Refresh token is incorrect!')

  const userId = await jwt_helpers.verifyRefreshToken(refreshTokenOnSession)

  const access = await jwt_helpers.signAccessToken(userId)
  const refreshToken = await jwt_helpers.signRefreshToken(userId)

  sess.access = access
  sess.refresh = refreshToken

  res.status(201).json({
    access: access,
    refresh: refreshToken,
  })
}

const logout = async (req, res, next) => {
  const sess = req.session
  try {
    if (!sess || !sess.username)
      throw createError.Unauthorized('Login to your account')

    await req.session.destroy()

    res.status(200).json({ message: `${sess.username} logout successfully!` })
  } catch (error) {
    next(error)
  }
}

const deactivate = async (req, res, next) => {
  const { username } = req.params
  const sess = req.session
  const updateSchema = z.object({
    disabled: z.boolean().default(true),
  })

  try {
    const user = await User.findOne({ where: { username: username } })

    if (!user) throw createError.NotFound(`No account for ${username}`)
    if (sess.username !== username) {
      throw createError.Forbidden(`Not allowed to edit user: ${sess.username}`)
    }
    if (!sess || !sess.username)
      throw createError.Unauthorized('Login to your account')

    const response = updateSchema.safeParse(req.body)

    user.disabled = response.data.disabled
    const deactivatedUser = await user.save()
    res
      .status(200)
      .json({ message: `${deactivatedUser.username} deactivated!` })

    if (deactivatedUser) await req.session.destroy()
  } catch (error) {
    next(error)
  }
}

const reactivate = async (req, res, next) => {
  const { username } = req.params
  const sess = req.session
  const updateSchema = z.object({
    disabled: z.boolean().default(false),
  })
  try {
    const disabledUser = await User.findOne({ where: { username: username } })

    if (!disabledUser) throw createError.NotFound(`No account for ${username}`)
    if (!sess || !sess.username)
      throw createError.Unauthorized('Login to your account')

    const response = updateSchema.safeParse(req.body)

    disabledUser.disabled = response.data.disabled
    const reactivatedUser = await disabledUser.save()
    res
      .status(200)
      .json({ message: `${reactivatedUser.username} reactivated!` })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  create,
  login,
  list,
  retrieve,
  update,
  requestAuthTokens,
  logout,
  deactivate,
  reactivate,
  createStaff,
}
