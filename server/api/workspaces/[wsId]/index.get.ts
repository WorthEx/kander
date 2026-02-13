export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const workspaceMember = await checkWorkspaceAccess(event, wsId)
  const workspace = await prisma.workspace.findUnique({where: {id: wsId}})

  return {
    workspaceMember,
    workspace
  }
})
