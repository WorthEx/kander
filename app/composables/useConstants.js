export const useConstants = () => {
  const req = useRequestURL()

  const apiBaseUrl = computed(_ => `${req.protocol}//${req.host}/api/v1`)

  return {apiBaseUrl}
}
