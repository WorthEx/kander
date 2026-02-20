export const useSort = _ => {
  const sortState = ref({key: null, direction: null})

  const toggleSort = (key) => {
    if (sortState.value.key !== key) {
      sortState.value = {key, direction: 'asc'}
    } else if (sortState.value.direction === 'asc') {
      sortState.value.direction = 'desc';
    } else if (sortState.value.direction === 'desc') {
      sortState.value = {key: null, direction: null}
    }
  }

  return {sortState, toggleSort}
}
