export const useColumns = () => {
  const cachedOrderColumns = useState('cachedOrderColumns')

  const addColumn = async (title, wsId) => {
    const newColumn = await $fetch(`/api/workspaces/${wsId}/columns`, {
      method: 'POST',
      credentials: 'include',
      body: {title}
    })
    cachedOrderColumns.value.push(newColumn)
    return newColumn
  }

  return {addColumn}
}
