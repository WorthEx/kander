import {H3Event} from "h3";

export const checkWorkspaceAccess = async (event: H3Event, wsId: string) => {
  checkUser(event)
  const userId = event.context.user.userId

  const wsMember = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: wsId,
      isFired: false
    }
  })
  if (!wsMember) throw createError({statusCode: 401, statusText: 'You\'re not an active member of this workspace.'})

  return wsMember
}
