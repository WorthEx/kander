import {checkWorkspaceAccess} from "#server/utils/checkWorkspaceAccess";

export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)
  return prisma.workspace.findUnique({where: {id: wsId}})
})
