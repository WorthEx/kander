// assigns next manager using round-robin algorithm

export const assignNextManager = async (wsId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: {id: wsId},
    include: {
      members: {
        where: {
          isFired: false,
        },
        include: {
          user: true,
        },
        orderBy: {
          userId: 'asc',
        },
      },
    },
  })

  if (!workspace || workspace.members.length === 0) {
    return null
  }

  const managersIdentities = workspace.members.map(m => m.user)

  let nextAssignedUser

  if (!workspace.lastAssignedManagerId) {
    nextAssignedUser = managersIdentities.at(0) // when there was no assigned manager
  } else {
    const lastIndex = managersIdentities.findIndex(user => user.id === workspace.lastAssignedManagerId)
    const nextIndex = lastIndex === -1 ? 0 : (lastIndex + 1) % managersIdentities.length
    nextAssignedUser = managersIdentities.at(nextIndex)
  }
  if (!nextAssignedUser) return null

  await prisma.workspace.update({
    where: {id: wsId},
    data: {lastAssignedManagerId: nextAssignedUser.id},
  })

  return nextAssignedUser.id
}
