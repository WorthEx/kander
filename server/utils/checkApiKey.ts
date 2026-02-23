import {H3Event} from "h3";

export const checkApiKey = async (event: H3Event) => {
  const apiKey = getHeader(event, 'x-api-key')
  if (!apiKey) throw createError(
    {statusCode: 401, statusText: 'API key not provided.'}
  )

  const workspace = await prisma.workspace.findUnique({where: {apiKey}})
  if (!workspace) throw createError(
    {statusCode: 401, statusText: 'Invalid API key.'}
  )

  return workspace.id
}
