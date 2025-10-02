import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    profile: null,
    isAuthenticated: false
  }),

  actions: {
    async fetchProfile() {
      try {
        const response = await axios.get('/api/profiles')
        // Tomar el primer profile del usuario (por ahora solo hay uno por usuario)
        if (response.data && response.data.length > 0) {
          this.profile = response.data[0]
        }
      } catch (error) {
        console.error('Error al obtener perfil:', error)
      }
    },

    async login(username, password) {
      try {
        const response = await axios.post('/api/auth/login', {
          username,
          password
        })

        this.token = response.data.token
        this.user = response.data.user

        // Guardar token en localStorage
        localStorage.setItem('token', this.token)

        // Configurar header de autenticación para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        this.isAuthenticated = true

        // Obtener el profile
        await this.fetchProfile()

        return { success: true }
      } catch (error) {
        console.error('Error en login:', error)
        return {
          success: false,
          message: error.response?.data?.error || 'Error al iniciar sesión'
        }
      }
    },

    async register(username, password) {
      try {
        const response = await axios.post('/api/auth/register', {
          username,
          password
        })

        this.token = response.data.token
        this.user = response.data.user

        // Guardar token en localStorage
        localStorage.setItem('token', this.token)

        // Configurar header de autenticación
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        this.isAuthenticated = true

        // Obtener el profile
        await this.fetchProfile()

        return { success: true }
      } catch (error) {
        console.error('Error en registro:', error)
        return {
          success: false,
          message: error.response?.data?.error || 'Error al registrar usuario'
        }
      }
    },

    logout() {
      // Limpiar estado
      this.user = null
      this.token = null
      this.profile = null
      this.isAuthenticated = false

      // Limpiar localStorage
      localStorage.removeItem('token')

      // Limpiar header de autenticación
      delete axios.defaults.headers.common['Authorization']
    },

    async checkAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        return false
      }

      try {
        // Configurar header antes de verificar
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Verificar token con el backend
        const response = await axios.get('/api/auth/verify')

        this.token = token
        this.user = response.data.user
        this.isAuthenticated = true

        // Obtener el profile
        await this.fetchProfile()

        return true
      } catch (error) {
        console.error('Token inválido:', error)
        this.logout()
        return false
      }
    }
  }
})
