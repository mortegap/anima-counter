import { defineStore } from 'pinia'
import axios from 'axios'
import { useProfilesStore } from './profiles'

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
    availableZeon: (state) => state.rzeon + state.zeona + state.zeonp - state.zeonToSpend - state.mantainZeonToSpend,

    // Total de hechizos a lanzar
    totalReadyToCast: (state) => state.readyToCast.length,

    // Total de hechizos mantenidos
    totalMantained: (state) => state.spellMantainList.length
  },

  actions: {
    async loadGameData() {
      const profilesStore = useProfilesStore()

      if (!profilesStore.activeProfileId) {
        console.error('No hay perfil activo')
        return
      }

      try {
        this.loading = true
        this.error = null

        const profileId = profilesStore.activeProfileId

        // Cargar estado del juego
        const gameStateResponse = await axios.get(`/api/gamestate/${profileId}`)
        this.updateLocalGameState(gameStateResponse.data)

        // Cargar hechizos
        const spellsResponse = await axios.get(`/api/spells/${profileId}`)
        this.spellBook = spellsResponse.data

        // Cargar ready to cast
        const readyToCastResponse = await axios.get(`/api/ready-to-cast/${profileId}`)
        this.readyToCast = readyToCastResponse.data
        this.updateZeonToSpend()

        // Cargar spell mantain list
        console.log('🔍 Cargando spell mantain list para perfil:', profileId)
        const spellMantainResponse = await axios.get(`/api/spell-mantain/${profileId}`)
        console.log('📦 Respuesta spell mantain:', spellMantainResponse.data)
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
      const profilesStore = useProfilesStore()

      if (!profilesStore.activeProfileId) return

      try {
        await axios.put(`/api/gamestate/${profilesStore.activeProfileId}`, {
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
      console.log('🔄 nextTurn() llamado')
      console.log('📊 Valores antes:', {
        turn_number: this.turn_number,
        rzeon: this.rzeon,
        mantainZeonToSpend: this.mantainZeonToSpend,
        spellMantainList: this.spellMantainList
      })

      this.turn_number++

      // Acumular act en zeona solo si acu está activo
      if (this.acu && this.act > 0) {
        this.zeona += this.act
      }

      // Restar zeon de mantenimiento de hechizos activos de la reserva de zeon
      if (this.mantainZeonToSpend > 0) {
        const rzeonAntes = this.rzeon
        this.rzeon = Math.max(this.rzeon - this.mantainZeonToSpend, 0)
        console.log(`✅ Zeon de mantenimiento restado: ${rzeonAntes} - ${this.mantainZeonToSpend} = ${this.rzeon}`)
      } else {
        console.log('⚠️ mantainZeonToSpend es 0 o undefined')
      }

      console.log('📊 Valores después:', {
        turn_number: this.turn_number,
        rzeon: this.rzeon
      })

      await this.saveGameState()
    },

    async previousTurn() {
      if (this.turn_number > 0) {
        this.turn_number--

        // Revertir acumulación de act solo si acu está activo
        if (this.acu && this.act > 0) {
          this.zeona = Math.max(this.zeona - this.act, 0)
        }

        // Revertir resta de zeon de mantenimiento
        if (this.mantainZeonToSpend > 0) {
          this.rzeon = Math.min(this.rzeon + this.mantainZeonToSpend, this.zeon)
        }

        await this.saveGameState()
      }
    },

    async newDay() {
      // Sumar rzeoni (regeneración zeónica) a rzeon (reserva de zeon) sin superar zeon (máximo)
      const newRzeon = this.rzeon + this.rzeoni
      this.rzeon = Math.min(newRzeon, this.zeon)

      await this.saveGameState()
    },

    async resetTurn() {
      this.turn_number = 0
      this.zeona = 0
      await this.saveGameState()
    },

    // Métodos de control de zeon
    updateZeonToSpend() {
      this.zeonToSpend = this.readyToCast.reduce((sum, spell) => {
        return sum + (spell.spell_zeon || spell.zeon_cost || 0)
      }, 0)
    },

    updateMantainZeonToSpend() {
      console.log('🔍 updateMantainZeonToSpend() llamado')
      console.log('📋 spellMantainList:', this.spellMantainList)

      this.mantainZeonToSpend = this.spellMantainList.reduce((sum, spell) => {
        const mantainValue = spell.spell_mantain || spell.mantain_cost || 0
        console.log(`  - Hechizo: ${spell.spell_name}, mantain: ${mantainValue}`)
        return sum + mantainValue
      }, 0)

      console.log('✅ Total mantainZeonToSpend:', this.mantainZeonToSpend)
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
      this.rzeon = Math.max(0, this.rzeon - amount)
      await this.saveGameState()
    },

    async addZeon(amount) {
      this.rzeon = Math.min(this.rzeon + amount, this.zeon)
      await this.saveGameState()
    },

    async updateCharacteristics(data) {
      Object.assign(this, data)
      await this.saveGameState()
    },

    // Métodos de hechizos
    async addSpell(spell) {
      const profilesStore = useProfilesStore()

      try {
        const response = await axios.post(`/api/spells/${profilesStore.activeProfileId}`, spell)
        this.spellBook.push(response.data)
      } catch (error) {
        console.error('Error añadiendo hechizo:', error)
        throw error
      }
    },

    async deleteSpell(spellId) {
      const profilesStore = useProfilesStore()

      try {
        await axios.delete(`/api/spells/${profilesStore.activeProfileId}/${spellId}`)
        this.spellBook = this.spellBook.filter(s => s.id !== spellId)
      } catch (error) {
        console.error('Error eliminando hechizo:', error)
        throw error
      }
    },

    async addToReadyToCast(spellData) {
      const profilesStore = useProfilesStore()

      try {
        console.log('🔍 addToReadyToCast - spellData recibido:', spellData)

        const response = await axios.post(`/api/ready-to-cast/${profilesStore.activeProfileId}`, spellData)

        console.log('✅ Respuesta del backend:', response.data)
        this.readyToCast.push(response.data)
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error añadiendo hechizo a lanzar:', error)
        throw error
      }
    },

    async removeFromReadyToCast(readyToCastId) {
      const profilesStore = useProfilesStore()

      try {
        await axios.delete(`/api/ready-to-cast/${profilesStore.activeProfileId}/${readyToCastId}`)
        this.readyToCast = this.readyToCast.filter(s => s.id !== readyToCastId)
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error eliminando hechizo a lanzar:', error)
        throw error
      }
    },

    async addToMantain(spell) {
      const profilesStore = useProfilesStore()

      try {
        const response = await axios.post(`/api/spell-mantain/${profilesStore.activeProfileId}`, {
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
      const profilesStore = useProfilesStore()

      try {
        await axios.delete(`/api/spell-mantain/${profilesStore.activeProfileId}/${mantainId}`)
        this.spellMantainList = this.spellMantainList.filter(s => s.id !== mantainId)
        this.updateMantainZeonToSpend()
      } catch (error) {
        console.error('Error eliminando hechizo mantenido:', error)
        throw error
      }
    },

    async clearAllReadyToCast() {
      const profilesStore = useProfilesStore()

      try {
        // Restar zeon total acumulado de la reserva de zeon
        if (this.zeonToSpend > 0) {
          this.rzeon = Math.max(this.rzeon - this.zeona, 0)
        }

        // Calcular excedente de zeon si zeona > zeon_to_spend
        if (this.zeona > this.zeonToSpend) {
          const excedente = this.zeona - this.zeonToSpend - 10
          if (excedente > 0) {
            this.rzeon = Math.min(this.rzeon + excedente, this.zeon)
          }
        }

        // Actualizar zeona a 0
        this.zeona = 0
        await this.saveGameState()

        // Añadir a spell_mantain_list los hechizos marcados con spell_mantain_turn
        const spellsToMantain = this.readyToCast.filter(spell => spell.spell_mantain_turn === true)

        for (const spell of spellsToMantain) {
          if (spell.spell_mantain && spell.spell_mantain > 0) {
            await axios.post(`/api/spell-mantain/${profilesStore.activeProfileId}`, {
              spell_id: spell.spell_id,
              spell_name: spell.spell_name,
              spell_mantain: spell.spell_mantain,
              spell_index: this.spellMantainList.length
            })
          }
        }

        // Recargar la lista de hechizos mantenidos
        const spellMantainResponse = await axios.get(`/api/spell-mantain/${profilesStore.activeProfileId}`)
        this.spellMantainList = spellMantainResponse.data
        this.updateMantainZeonToSpend()

        await axios.delete(`/api/ready-to-cast/${profilesStore.activeProfileId}`)
        this.readyToCast = []
        this.updateZeonToSpend()
      } catch (error) {
        console.error('Error limpiando hechizos a lanzar:', error)
        throw error
      }
    },

    async clearAllMantain() {
      const profilesStore = useProfilesStore()

      try {
        await axios.delete(`/api/spell-mantain/${profilesStore.activeProfileId}`)
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
