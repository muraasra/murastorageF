import { ref } from 'vue'

// Singleton — état partagé entre sidebar, navigation, topbar
const _show = ref(false)

export function useLogoutConfirm() {
  function requestLogout() {
    _show.value = true
  }

  function cancel() {
    _show.value = false
  }

  return { show: _show, requestLogout, cancel }
}
