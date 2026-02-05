export default defineEventHandler(async (event) => {
  try {
    const result = await prisma.user.findMany()

    return {
      result: true,
      data: result
    }
  } catch (e) {
    return {
      result: false
    }
  }
})
