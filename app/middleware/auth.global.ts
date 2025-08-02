/**
 * This file defines a Nuxt route middleware for authentication.
 * It checks the user's authentication status before each route navigation.
 * If the user is not authenticated and tries to access a protected route, they are redirected to the login page.
 * If the user is already authenticated and tries to access the login or register page, they are redirected to the home page.
 */

import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth()
  const cookie = useCookie('auth_token')
  const token = cookie.value

  // List of public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

  // If we have a token, check auth status
  if (token) {
    await checkAuth()
  }

  // Get fresh auth state after potential check
  const { isAuthenticated } = useAuth()

  // If the user is logged in and tries to access the login or register page
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }

  // If the user is not logged in and tries to access a protected route
  if (!isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
