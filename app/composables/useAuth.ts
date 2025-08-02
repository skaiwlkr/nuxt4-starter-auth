/**
 * This file defines a composable for authentication.
 * It provides access to the authentication state and methods.
 */

import { useAuthStore } from '~~/stores/auth'

export function useAuth() {
  const auth = useAuthStore()

  return {
    auth,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.token,
    checkAuth: auth.checkAuth,
    refresh: auth.checkAuth,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
  }
}
