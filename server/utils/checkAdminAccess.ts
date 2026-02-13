import {H3Event} from "h3";

export const checkAdminAccess = async (event: H3Event, wsId: string) => {
  checkUser(event)
  const userId = event.context.user.userId

  const wsAdmin = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: wsId,
      role: 'admin'
    }
  })
  if (!wsAdmin) throw createError({statusCode: 401, statusText: 'You don\t have admin access to this workspace.'})

  return wsAdmin
}
