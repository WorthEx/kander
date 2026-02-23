import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  const apiKey = crypto.randomBytes(24).toString('hex')

  await prisma.workspace.update({
    where: {
      id: wsId
    },
    data: {
      apiKey: apiKey
    }
  })

  return apiKey
})
