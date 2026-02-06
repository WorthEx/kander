import {checkUser} from "#server/utils/checkUser";

export default defineEventHandler(async (event) => {
  checkUser(event)
  try {
    return await prisma.user.findUnique({
        where: {id: event.context.user.userId}
      }
    )
  } catch (err) {
    throw createError({statusCode: 500, statusMessage: 'Couldn\'t fetch user info.'})
  }
})
