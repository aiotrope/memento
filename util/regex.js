const url =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

const name =
  /^[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?[a-zA-Z]{0,}[\s]?[a-zA-Z.]{0,}?$/gm

const username = /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm

const password = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?"*]).*$/gm

const regx = {
  url,
  name,
  username,
  password,
}

module.exports = regx
