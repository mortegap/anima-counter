import { defineStore } from 'pinia'
import axios from 'axios'

export const useProfilesStore = defineStore('profiles', {
  state: () => ({
    profiles: [],        // Lista de todos los perfiles del usuario
    activeProfile: null, // Perfil actualmente activo
    loading: false,
    error: null
  }),

  getters: {
    // ID del perfil activo
    activeProfileId: (state) => state.activeProfile?.id || null,

    // Nombre del perfil activo
    activeProfileName: (state) => state.activeProfile?.name || '',

    // Verificar si hay múltiples perfiles
    hasMultipleProfiles: (state) => state.profiles.length > 1,

    // Total de perfiles
    totalProfiles: (state) => state.profiles.length
  },

  actions: {
    /**
     * Cargar todos los perfiles del usuario autenticado
     */
    async fetchProfiles() {
      try {
        this.loading = true
        this.error = null

        const response = await axios.get('/api/profiles')
        this.profiles = response.data

        // Si no hay perfil activo y hay perfiles disponibles, activar el primero
        if (!this.activeProfile && this.profiles.length > 0) {
          this.activeProfile = this.profiles[0]
          // Guardar en localStorage
          localStorage.setItem('activeProfileId', this.activeProfile.id)
        }

        return this.profiles
      } catch (error) {
        console.error('Error obteniendo perfiles:', error)
        this.error = error.response?.data?.error || 'Error al obtener los perfiles'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear un nuevo perfil
     */
    async createProfile(name) {
      try {
        this.loading = true
        this.error = null

        // Validar longitud del nombre
        if (!name || name.length < 3 || name.length > 50) {
          throw new Error('El nombre debe tener entre 3 y 50 caracteres')
        }

        // Validar límite de perfiles (máximo 10)
        if (this.profiles.length >= 10) {
          throw new Error('Has alcanzado el límite máximo de 10 perfiles')
        }

        const response = await axios.post('/api/profiles', { name })
        this.profiles.push(response.data)

        return response.data
      } catch (error) {
        console.error('Error creando perfil:', error)
        this.error = error.message || error.response?.data?.error || 'Error al crear el perfil'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar el nombre de un perfil
     */
    async updateProfile(profileId, name) {
      try {
        this.loading = true
        this.error = null

        // Validar longitud del nombre
        if (!name || name.length < 3 || name.length > 50) {
          throw new Error('El nombre debe tener entre 3 y 50 caracteres')
        }

        const response = await axios.put(`/api/profiles/${profileId}`, { name })

        // Actualizar en la lista de perfiles
        const index = this.profiles.findIndex(p => p.id === profileId)
        if (index !== -1) {
          this.profiles[index] = response.data
        }

        // Si es el perfil activo, actualizarlo también
        if (this.activeProfile?.id === profileId) {
          this.activeProfile = response.data
        }

        return response.data
      } catch (error) {
        console.error('Error actualizando perfil:', error)
        this.error = error.message || error.response?.data?.error || 'Error al actualizar el perfil'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar un perfil
     */
    async deleteProfile(profileId) {
      try {
        this.loading = true
        this.error = null

        // No permitir eliminar el perfil activo
        if (this.activeProfile?.id === profileId) {
          throw new Error('No puedes eliminar el perfil activo. Cambia a otro perfil primero.')
        }

        // Verificar que no sea el único perfil
        if (this.profiles.length <= 1) {
          throw new Error('No puedes eliminar tu único perfil')
        }

        await axios.delete(`/api/profiles/${profileId}`)

        // Eliminar de la lista
        this.profiles = this.profiles.filter(p => p.id !== profileId)

        return true
      } catch (error) {
        console.error('Error eliminando perfil:', error)
        this.error = error.message || error.response?.data?.error || 'Error al eliminar el perfil'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Activar un perfil específico
     */
    async activateProfile(profileId) {
      try {
        // Buscar el perfil en la lista
        const profile = this.profiles.find(p => p.id === profileId)

        if (!profile) {
          throw new Error('Perfil no encontrado')
        }

        // Establecer como perfil activo
        this.activeProfile = profile

        // Guardar en localStorage
        localStorage.setItem('activeProfileId', profileId)

        return profile
      } catch (error) {
        console.error('Error activando perfil:', error)
        this.error = error.message || 'Error al activar el perfil'
        throw error
      }
    },

    /**
     * Establecer directamente el perfil activo (usado en el login)
     */
    setActiveProfile(profile) {
      this.activeProfile = profile
      if (profile?.id) {
        localStorage.setItem('activeProfileId', profile.id)
      }
    },

    /**
     * Restaurar perfil activo desde localStorage
     */
    restoreActiveProfile() {
      const storedProfileId = localStorage.getItem('activeProfileId')

      if (storedProfileId && this.profiles.length > 0) {
        const profile = this.profiles.find(p => p.id === storedProfileId)
        if (profile) {
          this.activeProfile = profile
        } else {
          // Si no se encuentra, usar el primero
          this.activeProfile = this.profiles[0]
          localStorage.setItem('activeProfileId', this.profiles[0].id)
        }
      } else if (this.profiles.length > 0) {
        // Si no hay nada guardado, usar el primero
        this.activeProfile = this.profiles[0]
        localStorage.setItem('activeProfileId', this.profiles[0].id)
      }
    },

    /**
     * Limpiar el estado (usado en logout)
     */
    resetState() {
      this.profiles = []
      this.activeProfile = null
      this.loading = false
      this.error = null
      localStorage.removeItem('activeProfileId')
    }
  }
})
