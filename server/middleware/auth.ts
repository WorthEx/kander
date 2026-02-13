import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const {jwtSecret} = useRuntimeConfig(event)
  const accessToken = getCookie(event, 'accessToken')
  const refreshToken = getCookie(event, 'refreshToken')

  let user
  let payload
  try {
    if (accessToken) {
      payload = jwt.verify(accessToken, jwtSecret) as any
      event.context.user = {
        userId: payload.userId,
        email: payload.email,
      }
    } else if (refreshToken) {
      payload = jwt.verify(refreshToken, jwtSecret) as any
      user = {
        userId: payload.userId,
        email: payload.email,
      }
      issueTokenPair(user, jwtSecret, event)
      event.context.user = user
    }
  } catch {
    console.log(`Couldn't verify token.`)
  }
})
