export default defineEventHandler(async (event) => {
  const wsId = await checkApiKey(event)

  return prisma.service.findMany({
    where: {
      isArchived: false,
      workspaceId: wsId
    }
  })
})
