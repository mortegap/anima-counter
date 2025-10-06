<template>
  <div>
    <!-- Header Fijo -->
    <header class="header-fixed">
      <div class="header-container">
        <!-- Logo y título -->
        <div class="d-flex align-items-center gap-2">
          <img src="/images/spellbook.png" alt="Spellbook" class="header-logo">
          <h5 class="mb-0">Anima Counter</h5>
        </div>

        <!-- Botones desktop -->
        <div class="header-actions desktop-only">
          <!-- Profile Selector -->
          <ProfileSelector />

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

        <!-- Botón hamburguesa mobile -->
        <button
          class="btn btn-outline-secondary hamburger-btn mobile-only"
          @click="toggleMobileMenu"
          :title="'Menu'"
        >
          <i class="bi bi-list fs-4"></i>
        </button>
      </div>

      <!-- Menú mobile desplegable -->
      <div class="mobile-menu" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <!-- Profile Selector -->
          <div class="mobile-menu-item">
            <ProfileSelector />
          </div>

          <a
            href="https://github.com/mortegap/anima-counter"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-secondary w-100 mobile-menu-item"
            :title="$t('header.viewOnGitHub')"
            @click="closeMobileMenu"
          >
            <i class="bi bi-github me-2"></i>
            {{ $t('header.viewOnGitHub') }}
          </a>

          <button
            class="btn btn-outline-secondary w-100 mobile-menu-item"
            @click="toggleLocale(); closeMobileMenu()"
          >
            <i class="bi bi-translate me-2"></i>
            {{ currentLocale === 'es' ? 'English' : 'Español' }}
          </button>

          <button
            class="btn btn-outline-secondary w-100 mobile-menu-item"
            @click="toggleTheme(); closeMobileMenu()"
          >
            <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'" class="me-2"></i>
            {{ $t('header.changeTheme') }}
          </button>

          <button
            class="btn btn-danger w-100 mobile-menu-item"
            @click="handleLogout"
          >
            <i class="bi bi-box-arrow-right me-2"></i>
            {{ $t('header.logout') }}
          </button>
        </div>
      </div>

      <!-- Backdrop del menú mobile -->
      <div
        class="mobile-menu-backdrop"
        :class="{ 'mobile-menu-backdrop-open': isMobileMenuOpen }"
        @click="closeMobileMenu"
      ></div>
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
import ProfileSelector from '@/components/ProfileSelector.vue'

export default {
  name: 'Home',
  components: {
    CharacterStats,
    ZeonControl,
    SpellBook,
    ReadyToCast,
    MaintainedSpells,
    ProfileSelector
  },
  setup() {
    const router = useRouter()
    const { locale } = useI18n()
    const authStore = useAuthStore()
    const gameState = useGameStateStore()
    const spellsStore = useSpellsStore()

    const isDarkMode = ref(false)
    const currentLocale = ref(locale.value)
    const isMobileMenuOpen = ref(false)

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

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    return {
      authStore,
      gameState,
      isDarkMode,
      currentLocale,
      isMobileMenuOpen,
      toggleTheme,
      toggleLocale,
      handleLogout,
      toggleMobileMenu,
      closeMobileMenu
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

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

/* Mostrar/ocultar según el tamaño de pantalla */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

/* Menú móvil */
.mobile-menu {
  position: fixed;
  top: 60px;
  right: -100%;
  width: 280px;
  max-width: 80vw;
  height: calc(100vh - 60px);
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease-in-out;
  z-index: 1001;
  overflow-y: auto;
}

.mobile-menu-open {
  right: 0;
}

.mobile-menu-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-menu-item {
  margin: 0;
}

.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
}

.mobile-menu-backdrop-open {
  opacity: 1;
  visibility: visible;
}

.hamburger-btn {
  padding: 0.375rem 0.75rem;
}

/* Dark mode */
body.dark-mode .header-fixed {
  background: #1a1a1a;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

body.dark-mode .mobile-menu {
  background: #1a1a1a;
  box-shadow: -2px 0 8px rgba(255, 255, 255, 0.1);
}

/* Media queries para responsive */
@media (max-width: 768px) {
  .header-fixed {
    padding: 0.75rem 1rem;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block;
  }

  .main-content {
    margin-top: 70px;
  }
}

@media (max-width: 480px) {
  .header-fixed h5 {
    font-size: 1rem;
  }

  .header-logo {
    width: 28px;
    height: 28px;
  }

  .mobile-menu {
    width: 100%;
    max-width: 100vw;
  }
}
</style>
