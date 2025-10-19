import { defineStore } from 'pinia'
import { useCookie } from '#app'
import { ref } from 'vue'

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const baseUrl = ref('https://murastorage.pythonanywhere.com')

  const cookieToken = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60*24 , // 1 jour
    httpOnly: false
  })

  const token = ref(cookieToken.value)

  function setToken(newToken: string) {
    token.value = newToken
    cookieToken.value = newToken
    if (process.client) {
      localStorage.setItem('access_token', newToken)
    }
  }

  function setUser(data: User) {
    user.value = data
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(data))
    }
  }

  function restoreUser() {
    if (process.client) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Erreur lors de la restauration des données utilisateur:', e)
          localStorage.removeItem('user')
        }
      }
    }
  }

  function restoreAllData() {
    if (process.client) {
      const storedToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      
      if (storedToken) {
        token.value = storedToken
        cookieToken.value = storedToken
      }
      
      restoreUser()
    }
  }

  function logout() {
    token.value = null
    cookieToken.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('entreprise')
      localStorage.removeItem('boutique')
      localStorage.removeItem('permissions')
      localStorage.removeItem('remember_me')
    }
    navigateTo('/connexion')
  }

  // restauration automatique si client
  if (process.client) {
    restoreAllData()
  }

  return { user, token, baseUrl, setToken, setUser, logout, restoreAllData }
})