import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<any>(null)

  const login = (token: string, userData: any) => {
    localStorage.setItem('access_token', token)
    isAuthenticated.value = true
    user.value = userData
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    isAuthenticated.value = false
    user.value = null
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
  }
})
