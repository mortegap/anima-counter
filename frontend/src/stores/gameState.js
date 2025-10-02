import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useGameStateStore = defineStore('gameState', {
  state: () => ({
    // Estado del juego
    turn_number: 0,
    zeon: 0,
    rzeon: 0,
    act: 0,
    rzeoni: 0,
    zeona: 0,
    zeonp: 0,
    acu: false,
    lock: 0,
    zeonToSpend: 0,
    mantainZeonToSpend: 0,

    // Listas de hechizos
    spellBook: [],
    readyToCast: [],
    spellMantainList: [],

    // Estado de carga
    loading: false,
    error: null
  }),

  getters: {
    // Zeon total acumulado
    totalZeonAccumulated: (state) => state.zeona + state.zeonp,

    // Zeon disponible para gastar
    availableZeon: (state) => state.zeon + state.zeona + state.zeonp - state.zeonToSpend - state.mantainZeonToSpend,

    // Total de hechizos a lanzar
    totalReadyToCast: (state) => state.readyToCast.length,

    // Total de hechizos mantenidos
    totalMantained: (state) => state.spellMantainList.length
  },

  actions: {
    async loadGameData() {
      const authStore = useAuthStore()

      if (!authStore.profile?.id) {
        console.error('No hay perfil cargado')
        return
      }

      try {
        this.loading = true
        this.error = null

        // Cargar estado del juego
        const gameStateResponse = await axios.get(`/api/gamestate/${authStore.profile.id}`)
        this.updateLocalGameState(gameStateResponse.data)

        // Cargar hechizos
        const spellsResponse = await axios.get(`/api/spells/${authStore.profile.id}`)
        this.spellBook = spellsResponse.data

        // Cargar ready to cast
        const readyToCastResponse = await axios.get(`/api/ready-to-cast/${authStore.profile.id}`)
        this.readyToCast = readyToCastResponse.data
        this.updateZeonToSpend()

        // Cargar spell mantain list
        const spellMantainResponse = await axios.get(`/api/spell-mantain/${authStore.profile.id}`)
        this.spellMantainList = spellMantainResponse.data
        this.updateMantainZeonToSpend()

      } catch (error) {
        console.error('Error cargando datos del juego:', error)
        this.error = error.response?.data?.error || 'Error al cargar los datos del juego'
      } finally {
        this.loading = false
      }
    },

    updateLocalGameState(gameState) {
      // Usar nullish coalescing (??) para permitir valores 0
      this.turn_number = gameState.turn_number ?? 0
      this.zeon = gameState.zeon ?? 0
      this.rzeon = gameState.rzeon ?? 0
      this.act = gameState.act ?? 0
      this.rzeoni = gameState.rzeoni ?? 0
      this.zeona = gameState.zeona ?? 0
      this.zeonp = gameState.zeonp ?? 0
      this.acu = gameState.acu ?? false
      this.lock = gameState.lock_state ?? 0
      this.zeonToSpend = gameState.zeon_to_spend ?? 0
      this.mantainZeonToSpend = gameState.mantain_zeon_to_spend ?? 0
    },

    async saveGameState() {
      const authStore = useAuthStore()

      if (!authStore.profile?.id) return

      try {
        await axios.put(`/api/gamestate/${authStore.profile.id}`, {
          turn_number: this.turn_number,
          zeon: this.zeon,
          rzeon: this.rzeon,
          act: this.act,
          rzeoni: this.rzeoni,
          zeona: this.zeona,
          zeonp: this.zeonp,
          acu: this.acu,
          lock_state: this.lock,
          zeon_to_spend: this.zeonToSpend,
          mantain_zeon_to_spend: this.mantainZeonToSpend
        })
      } catch (error) {
        console.error('Error guardando estado del juego:', error)
        this.error = error.response?.data?.error || 'Error al guardar el estado'
      }
    },

    // Métodos de control de turnos
    async nextTurn() {
      this.turn_number++

      // Regenerar zeon
      if (this.rzeoni > 0) {
        this.zeon = Math.min(this.zeon + this.rzeoni, this.rzeon)
      }

      await this.saveGameState()
    },

    async previousTurn() {
      if (this.turn_number > 0) {
        this.turn_number--

        // Revertir regeneración de zeon
        if (this.rzeoni > 0) {
          this.zeon = Math.max(this.zeon - this.rzeoni, 0)
        }

        await this.saveGameState()
      }
    },

    // Métodos de control de zeon
    updateZeonToSpend() {
      this.zeonToSpend = this.readyToCast.reduce((sum, spell) => {
        return sum + (spell.zeon_cost || 0)
      }, 0)
    },

    updateMantainZeonToSpend() {
      this.mantainZeonToSpend = this.spellMantainList.reduce((sum, spell) => {
        return sum + (spell.mantain_cost || 0)
      }, 0)
    },

    async addZeonAccumulated(amount, type = 'normal') {
      if (type === 'normal') {
        this.zeona += amount
      } else {
        this.zeonp += amount
      }
      await this.saveGameState()
    },

    async spendZeon(amount) {
      this.zeon = Math.max(0, this.zeon - amount)
      await this.saveGameState()
    },

    async addZeon(amount) {
      this.zeon = Math.min(this.zeon + amount, this.rzeon)
      await this.saveGameState()
    },

    async updateCharacteristics(data) {
      Object.assign(this, data)
      await this.saveGameState()
    },

    // Métodos de hechizos
    async addSpell(spell) {
      const authStore = useAuthStore()

      try {
        const response = await axios.post(`/api/spells/${authStore.profile.id}`, spell)
        this.spellBook.push(response.data)
      } catch (error) {
        console.error('Error añadiendo hechizo:', error)
        throw error
      }
    },

    async deleteSpell(spellId) {
      const authStore = useAuthStore()

      try {
        await axios.delete(`/api/spells/${authStore.profile.id}/${spellId}`)
        this.spellBook = this.spellBook.filter(s => s.id !== spellId)
      } catch (error) {
        console.error('Error eliminando hechizo:', error)
        throw error
      }
    },

    async addToReadyToCast(spell) {
      const authStore = useAuthStore()

      try {
        const response = await axios.post(`/api/ready-to-cast/${authStore.profile.id}`, {
          spell_id: spell.id,
          zeon_cost: spell.zeon_cost
        })
        this.readyToCast.push(response.data)
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error añadiendo hechizo a lanzar:', error)
        throw error
      }
    },

    async removeFromReadyToCast(readyToCastId) {
      const authStore = useAuthStore()

      try {
        await axios.delete(`/api/ready-to-cast/${authStore.profile.id}/${readyToCastId}`)
        this.readyToCast = this.readyToCast.filter(s => s.id !== readyToCastId)
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error eliminando hechizo a lanzar:', error)
        throw error
      }
    },

    async addToMantain(spell) {
      const authStore = useAuthStore()

      try {
        const response = await axios.post(`/api/spell-mantain/${authStore.profile.id}`, {
          spell_id: spell.id,
          mantain_cost: spell.mantain_cost
        })
        this.spellMantainList.push(response.data)
        this.updateMantainZeonToSpend()
      } catch (error) {
        console.error('Error añadiendo hechizo a mantener:', error)
        throw error
      }
    },

    async removeFromMantain(mantainId) {
      const authStore = useAuthStore()

      try {
        await axios.delete(`/api/spell-mantain/${authStore.profile.id}/${mantainId}`)
        this.spellMantainList = this.spellMantainList.filter(s => s.id !== mantainId)
        this.updateMantainZeonToSpend()
      } catch (error) {
        console.error('Error eliminando hechizo mantenido:', error)
        throw error
      }
    },

    async clearAllReadyToCast() {
      const authStore = useAuthStore()

      try {
        await axios.delete(`/api/ready-to-cast/${authStore.profile.id}`)
        this.readyToCast = []
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error limpiando hechizos a lanzar:', error)
        throw error
      }
    },

    async clearAllMantain() {
      const authStore = useAuthStore()

      try {
        await axios.delete(`/api/spell-mantain/${authStore.profile.id}`)
        this.spellMantainList = []
        this.updateMantainZeonToSpend()
      } catch (error) {
        console.error('Error limpiando hechizos mantenidos:', error)
        throw error
      }
    },

    // Limpiar estado al hacer logout
    resetState() {
      this.turn_number = 0
      this.zeon = 0
      this.rzeon = 0
      this.act = 0
      this.rzeoni = 0
      this.zeona = 0
      this.zeonp = 0
      this.acu = false
      this.lock = 0
      this.zeonToSpend = 0
      this.mantainZeonToSpend = 0
      this.spellBook = []
      this.readyToCast = []
      this.spellMantainList = []
      this.loading = false
      this.error = null
    }
  }
})
