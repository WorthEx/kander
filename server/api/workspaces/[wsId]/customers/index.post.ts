export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {
    fullName,
    phone,
    countryCode,
    city,
    region,
    addressLine1,
    addressLine2,
    postalCode,
  } = await readBody(event)
  if (!fullName || !phone || !countryCode || !city) return createError({
    statusCode: 400,
    statusText: 'No full name, phone number, country code or city provided.'
  })

  await prisma.customer.upsert({
    where: {
      phone_workspaceId: {
        phone,
        workspaceId: wsId
      }
    },
    update: {},
    create: {
      fullName,
      phone,
      countryCode,
      city,
      region,
      addressLine1,
      addressLine2,
      postalCode,
      workspaceId: wsId
    }
  })

  return {ok: true}
})
