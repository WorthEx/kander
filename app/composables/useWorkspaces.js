export const useWorkspaces = () => {
  const cachedWorkspaces = useState('cachedWorkspaces', _ => [])

  const create = async title => {
    await $fetch("/api/workspaces/create", {
      method: 'POST',
      credentials: 'include',
      query: {title}
    })
  }

  const getAll = async _ => {
    cachedWorkspaces.value = await $fetch("/api/workspaces")
  }

  return {create, getAll, cachedWorkspaces}
}
