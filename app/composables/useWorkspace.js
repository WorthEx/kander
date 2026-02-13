export const useWorkspace = () => {

  const editTitle = async (title, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/change-title`, {
      method: 'POST',
      credentials: 'include',
      body: {
        title
      }
    })
  }

  const deleteWorkspace = async wsId => {
    await $fetch(`/api/workspaces/${wsId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {editTitle, deleteWorkspace}
}
