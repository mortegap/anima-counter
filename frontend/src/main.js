import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './config/axios' // Configuración global de axios
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/style.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

// Verificar autenticación antes de montar la app
const authStore = useAuthStore()
authStore.checkAuth().finally(() => {
  app.mount('#app')
})
