<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2>Anima Counter</h2>
        <p class="text-muted mb-0">{{ authStore.user?.username }} - {{ authStore.profile?.name }}</p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-secondary"
          @click="toggleTheme"
          title="Cambiar tema"
        >
          <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
        </button>
        <button
          class="btn btn-danger"
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="gameState.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="gameState.error" class="alert alert-danger" role="alert">
      {{ gameState.error }}
    </div>

    <!-- Main Content -->
    <div v-if="!gameState.loading" class="row">
      <!-- Columna Izquierda -->
      <div class="col-lg-4">
        <TurnCounter />
        <CharacterStats />
      </div>

      <!-- Columna Central -->
      <div class="col-lg-4">
        <ZeonControl />
      </div>

      <!-- Columna Derecha - Hechizos -->
      <div class="col-lg-12">
        <SpellForm />
        <SpellBook />
        <ReadyToCast />
        <MaintainedSpells />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStateStore } from '@/stores/gameState'
import { useSpellsStore } from '@/stores/spells'
import TurnCounter from '@/components/TurnCounter.vue'
import CharacterStats from '@/components/CharacterStats.vue'
import ZeonControl from '@/components/ZeonControl.vue'
import SpellForm from '@/components/spells/SpellForm.vue'
import SpellBook from '@/components/spells/SpellBook.vue'
import ReadyToCast from '@/components/spells/ReadyToCast.vue'
import MaintainedSpells from '@/components/spells/MaintainedSpells.vue'

export default {
  name: 'Home',
  components: {
    TurnCounter,
    CharacterStats,
    ZeonControl,
    SpellForm,
    SpellBook,
    ReadyToCast,
    MaintainedSpells
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const gameState = useGameStateStore()
    const spellsStore = useSpellsStore()

    const isDarkMode = ref(false)

    onMounted(async () => {
      // Cargar tema guardado
      const savedTheme = localStorage.getItem('theme')
      isDarkMode.value = savedTheme === 'dark'
      if (isDarkMode.value) {
        document.body.classList.add('dark-mode')
      }

      // Cargar datos del juego
      await gameState.loadGameData()

      // Cargar datos de hechizos
      await spellsStore.fetchSpellBook()
      await spellsStore.fetchReadyToCast()
      await spellsStore.fetchMaintainedSpells()
    })

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.body.classList.toggle('dark-mode')
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }

    const handleLogout = async () => {
      gameState.resetState()
      spellsStore.resetSpellData()
      authStore.logout()
      router.push('/login')
    }

    return {
      authStore,
      gameState,
      isDarkMode,
      toggleTheme,
      handleLogout
    }
  }
}
</script>
