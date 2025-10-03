<template>
  <div>
    <!-- Header Fijo -->
    <header class="header-fixed">
      <div class="d-flex justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          <img src="/images/spellbook.png" alt="Spellbook" class="header-logo">
          <h5 class="mb-0">Anima Counter</h5>
        </div>
        <div class="d-flex gap-2">
          <a
            href="https://github.com/mortegap/anima-counter"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-secondary"
            :title="$t('header.viewOnGitHub')"
          >
            <i class="bi bi-github"></i>
          </a>
          <button
            class="btn btn-outline-secondary"
            @click="toggleLocale"
            :title="currentLocale === 'es' ? 'Change to English' : 'Cambiar a Español'"
          >
            {{ currentLocale === 'es' ? 'EN' : 'ES' }}
          </button>
          <button
            class="btn btn-outline-secondary"
            @click="toggleTheme"
            :title="$t('header.changeTheme')"
          >
            <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
          </button>
          <button
            class="btn btn-danger"
            @click="handleLogout"
            :title="$t('header.logout')"
          >
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>

    <div class="container-fluid main-content">

    <!-- Loading State -->
    <div v-if="gameState.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}</span>
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
        <CharacterStats />
      </div>

      <!-- Columna Central -->
      <div class="col-lg-4">
        <ZeonControl />
      </div>

      <!-- Columna Derecha - Hechizos -->
      <div class="col-lg-12">
        <SpellBook />
        <ReadyToCast />
        <MaintainedSpells />
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useGameStateStore } from '@/stores/gameState'
import { useSpellsStore } from '@/stores/spells'
import CharacterStats from '@/components/CharacterStats.vue'
import ZeonControl from '@/components/ZeonControl.vue'
import SpellBook from '@/components/spells/SpellBook.vue'
import ReadyToCast from '@/components/spells/ReadyToCast.vue'
import MaintainedSpells from '@/components/spells/MaintainedSpells.vue'

export default {
  name: 'Home',
  components: {
    CharacterStats,
    ZeonControl,
    SpellBook,
    ReadyToCast,
    MaintainedSpells
  },
  setup() {
    const router = useRouter()
    const { locale } = useI18n()
    const authStore = useAuthStore()
    const gameState = useGameStateStore()
    const spellsStore = useSpellsStore()

    const isDarkMode = ref(false)
    const currentLocale = ref(locale.value)

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

    const toggleLocale = () => {
      const newLocale = currentLocale.value === 'es' ? 'en' : 'es'
      locale.value = newLocale
      currentLocale.value = newLocale
      localStorage.setItem('locale', newLocale)
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
      currentLocale,
      toggleTheme,
      toggleLocale,
      handleLogout
    }
  }
}
</script>

<style scoped>
.header-fixed {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 2rem;
  z-index: 1000;
}

.header-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.main-content {
  margin-top: 80px;
  padding: 1rem;
}

body.dark-mode .header-fixed {
  background: #1a1a1a;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}
</style>
