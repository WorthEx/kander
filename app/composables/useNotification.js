export const useNotification = useToastInstance => {

  const error = (title = 'We have a problem', icon = 'i-ri-error-warning-fill') => {
    useToastInstance.add({
      title,
      icon: icon,
      color: 'error',

    })
  }

  const success = (title = 'Success', icon = 'i-ri-checkbox-circle-fill') => {
    useToastInstance.add({
      title,
      icon: icon,
      color: 'success',

    })
  }

  const info = (title, icon = 'i-ri-information-fill') => {
    useToastInstance.add({
      title,
      icon: icon,
      color: 'info',

    })
  }

  const warning = (title, icon = 'i-ri-error-warning-fill') => {
    useToastInstance.add({
      title,
      icon: icon,
      color: 'warning',

    })
  }

  return {error, success, info, warning}
}
