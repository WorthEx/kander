import {H3Event} from "h3";

export const checkUser = (event: H3Event) => {
  if (!event.context.user) throw createError({statusCode: 401, statusMessage: 'Not authorized'})
}
