import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

// Obtener idioma del localStorage o usar español por defecto
const savedLocale = localStorage.getItem('locale') || 'es'

const i18n = createI18n({
  legacy: false, // Usar Composition API
  locale: savedLocale,
  fallbackLocale: 'es',
  messages: {
    es,
    en
  }
})

export default i18n
