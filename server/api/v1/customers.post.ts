export default defineEventHandler(async (event) => {
  const wsId = await checkApiKey(event)

  const body = await readBody(event)
  if (!body.fullName) throw createError({statusCode: 400, statusMessage: 'No full name provided.'})
  if (!body.phone) throw createError({statusCode: 400, statusMessage: 'No phone number provided.'})
  if (!body.countryCode) throw createError({statusCode: 400, statusMessage: 'No country code provided.'})
  if (!body.city) throw createError({statusCode: 400, statusMessage: 'No city provided.'})

  return prisma.customer.upsert({
    where: {
      phone_workspaceId: {
        phone: body.phone,
        workspaceId: wsId
      }
    },
    update: {},
    create: {
      fullName: body.fullName,
      phone: body.phone,
      countryCode: body.countryCode,
      city: body.city,
      region: body.region,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      postalCode: body.postalCode,
      workspaceId: wsId
    }
  })
})
