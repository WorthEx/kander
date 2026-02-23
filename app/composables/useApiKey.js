export const useApiKey = _ => {
  const cachedApiKey = useState('cachedApiKey', _ => null)
  const apiKeyFetched = useState('apiKeyFetched', _ => false)

  const route = useRoute()
  const wsId = computed(() => route.params.wsId)

  const fetchKey = async _ => {
    cachedApiKey.value = ''
    apiKeyFetched.value = false
    const res = await $fetch(`/api/workspaces/${wsId.value}/api-key`, {
      credentials: 'include',
    })
    cachedApiKey.value = res.apiKey
    apiKeyFetched.value = true
  }

  const generateKey = async _ => {
    cachedApiKey.value = await $fetch(`/api/workspaces/${wsId.value}/api-key`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  const revokeKey = async _ => {
    await $fetch(`/api/workspaces/${wsId.value}/api-key`, {
      method: 'DELETE',
      credentials: 'include',
    })
    cachedApiKey.value = ''
  }

  return {cachedApiKey, apiKeyFetched, fetchKey, generateKey, revokeKey}
}
