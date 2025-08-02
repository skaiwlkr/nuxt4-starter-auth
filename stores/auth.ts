import { defineStore } from 'pinia'

interface User {
  uuid: string
  email: string
  email_verified: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string | null
  password: string
  terms_of_service: string | null
  privacy_policy: string | null
  flags: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

interface LoginResponse {
  user: User
  token: string
}

interface RegisterResponse {
  user: User
  token: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  actions: {
    async login(email: string, password: string, turnstileToken: string) {
      try {
        const _config = useRuntimeConfig()
        const response = await $fetch<LoginResponse>('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, turnstileToken }),
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Store token in cookie
        const cookie = useCookie('auth_token', {
          /* maxAge: 30 * 1000, // 30 seconds (Debugging) */
          maxAge: 60 * 60 * 24 * 7, // 1 Week
          path: '/',
          secure: true,
          sameSite: 'strict',
        })
        cookie.value = response.token
      }
      catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(email: string, password: string, turnstileToken: string) {
      try {
        const _config = useRuntimeConfig()
        const response = await $fetch<RegisterResponse>('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, turnstileToken }),
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Store token in cookie
        const cookie = useCookie('auth_token', {
          /* maxAge: 30 * 1000, // 30 seconds (Debugging) */
          maxAge: 60 * 60 * 24 * 7, // 1 Week
          path: '/',
          secure: true,
          sameSite: 'strict',
        })
        cookie.value = response.token
      }
      catch (error) {
        console.error('Registration error:', error)
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      // Remove token from cookie
      const cookie = useCookie('auth_token')
      cookie.value = null
    },

    async checkAuth() {
      const cookie = useCookie('auth_token')
      const token = cookie.value

      if (!token) {
        this.logout()
        return
      }

      try {
        const response = await $fetch<{ user: User }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        this.user = response.user
        this.token = token
        this.isAuthenticated = true
      }
      catch (error) {
        console.error('Auth check error:', error)
        this.logout()
      }
    },
  },
})
