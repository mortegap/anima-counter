<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="text-center mb-4">{{ $t('auth.register') }}</h2>

      <form @submit.prevent="handleRegister">
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
            autocomplete="new-password"
          >
        </div>

        <div class="mb-3">
          <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            autocomplete="new-password"
          >
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? $t('auth.registering') : $t('auth.register') }}
        </button>
      </form>

      <div class="text-center mt-3">
        <p>{{ $t('auth.hasAccount') }} <router-link to="/login">{{ $t('auth.loginLink') }}</router-link></p>
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
  name: 'Register',
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const authStore = useAuthStore()

    const username = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const errorMessage = ref('')
    const loading = ref(false)

    const handleRegister = async () => {
      errorMessage.value = ''

      // Validar que las contraseñas coincidan
      if (password.value !== confirmPassword.value) {
        errorMessage.value = t('auth.passwordsDontMatch')
        return
      }

      loading.value = true

      const result = await authStore.register(username.value, password.value)

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
      confirmPassword,
      errorMessage,
      loading,
      handleRegister
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
