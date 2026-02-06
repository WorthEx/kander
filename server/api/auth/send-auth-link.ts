import crypto from 'crypto'
import {Resend} from 'resend'

const resend = new Resend(process.env.NUXT_RESEND_KEY)

export default defineEventHandler(async (event) => {
  const {email} = await readBody(event)

  if (!email) {
    throw createError({statusCode: 400})
  }

  const user = await prisma.user.upsert({
    where: {email},
    create: {email},
    update: {}
  })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  await prisma.magicLink.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    }
  })

  const domain = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://kander.space'
  const magicLink = `${domain}/auth/verify?token=${token}`

  await resend.emails.send({
    to: email,
    from: 'Kander Auth <auth@kander.space>',
    template: {
      id: 'authentication',
      variables: {
        magic_link: magicLink,
      },
    },
  })

  return {ok: true}
})
