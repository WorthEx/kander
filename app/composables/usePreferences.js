export const usePreferences = () => {
  const preferences = useCookie('preferences', {
      default: _ => ({
        hiddenColumnIds: [],
      }),
    }
  )

  const hideColumn = id => {
    if (preferences.value.hiddenColumnIds.includes(id)) return
    preferences.value.hiddenColumnIds.push(id)
  }

  const showColumn = id => {
    preferences.value.hiddenColumnIds = preferences.value.hiddenColumnIds.filter(hid => hid !== id)
  }

  return {preferences, hideColumn, showColumn}
}
