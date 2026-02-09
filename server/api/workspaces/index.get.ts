export default defineEventHandler(async (event) => {
  checkUser(event)
  const userId = event.context.user.userId

  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
          isFired: false
        }
      }
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          members: {
            where: {
              isFired: false
            }
          }
        }
      },
      members: {
        where: {
          userId
        },
        select: {
          role: true
        }
      }
    },
  })
})
