export const useWorkspace = () => {

  const editWorkspace = async (title, currency, wsId) => {
    await $fetch(`/api/workspaces/${wsId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        title,
        currency
      }
    })
  }

  const deleteWorkspace = async wsId => {
    await $fetch(`/api/workspaces/${wsId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {editWorkspace, deleteWorkspace}
}
