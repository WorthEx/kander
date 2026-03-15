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

  const renameColumn = async (columnId, updatedTitle, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/columns`, {
      method: 'PATCH',
      credentials: 'include',
      body: {columnId, updatedTitle}
    })
    cachedOrderColumns.value = cachedOrderColumns.value.map(column => {
      if (column.id === columnId) {
        return {...column, title: updatedTitle};
      }
      return column
    })
  }

  const removeColumn = async (columnId, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/columns`, {
      method: 'DELETE',
      credentials: 'include',
      body: {columnId}
    })
    cachedOrderColumns.value = cachedOrderColumns.value.filter(column => column.id !== columnId)
  }

  return {addColumn, removeColumn, renameColumn}
}
