import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string

  if (!token) {
    throw createError({statusCode: 400})
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const magicLink = await prisma.magicLink.findFirst({
    where: {
      tokenHash,
      expiresAt: {gt: new Date()}
    },
    include: {user: true}
  })

  if (!magicLink) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired link'
    })
  }

  await prisma.magicLink.deleteMany({
    where: {
      userId: magicLink.userId
    }
  })

  const {jwtSecret} = useRuntimeConfig(event)

  const accessToken = jwt.sign(
    {
      userId: magicLink.user.id,
      phone: magicLink.user.email,
    },
    jwtSecret, {expiresIn: '5m'})

  const refreshToken = jwt.sign(
    {
      userId: magicLink.user.id,
      phone: magicLink.user.email,
    },
    jwtSecret, {expiresIn: '1w'})

  setCookie(event, 'accessToken', accessToken, {
    expires: new Date(Date.now() + (1000 * 60 * 5)),
  })
  setCookie(event, 'refreshToken', refreshToken, {
    expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)),
  })

  return sendRedirect(event, '/dashboard')
})
