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

  return {editTitle}
}
