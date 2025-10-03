<template>
  <div class="auth-container">
    <button
      class="language-toggle btn btn-outline-secondary"
      @click="toggleLocale"
      :title="currentLocale === 'es' ? 'Change to English' : 'Cambiar a Español'"
    >
      {{ currentLocale === 'es' ? 'EN' : 'ES' }}
    </button>
    <div class="auth-card">
      <h2 class="text-center mb-4">{{ $t('auth.login') }}</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="username" class="form-label">{{ $t('auth.username') }}</label>
          <input
            type="text"
            class="form-control"
            id="username"
            v-model="username"
            required
            autocomplete="username"
          >
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            required
            autocomplete="current-password"
          >
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? $t('auth.loggingIn') : $t('auth.login') }}
        </button>
      </form>

      <div class="text-center mt-3">
        <p>{{ $t('auth.noAccount') }} <router-link to="/register">{{ $t('auth.registerLink') }}</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const { locale } = useI18n()
    const authStore = useAuthStore()

    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const loading = ref(false)
    const currentLocale = ref(locale.value)

    const toggleLocale = () => {
      const newLocale = currentLocale.value === 'es' ? 'en' : 'es'
      locale.value = newLocale
      currentLocale.value = newLocale
      localStorage.setItem('locale', newLocale)
    }

    const handleLogin = async () => {
      errorMessage.value = ''
      loading.value = true

      const result = await authStore.login(username.value, password.value)

      loading.value = false

      if (result.success) {
        router.push('/')
      } else {
        errorMessage.value = result.message
      }
    }

    return {
      username,
      password,
      errorMessage,
      loading,
      currentLocale,
      toggleLocale,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
}

.language-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: white;
  border-color: #dee2e6;
}

.language-toggle:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body.dark-mode .auth-card {
  background: rgba(45, 45, 45, 0.95);
}
</style>
