import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/index';
import App from './App.vue';
import '@/styles/index.scss';
import { initGA } from '@/utils/analytics';
import { createGtag } from 'vue-gtag';

// Initialize Google Analytics
initGA();

// Log environment variables for verification
console.log('Environment Variables Check:');
console.log('VITE_GOOGLE_ADSENSE_ID:', import.meta.env.VITE_GOOGLE_ADSENSE_ID);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SHOW_ADS:', import.meta.env.VITE_SHOW_ADS);

const app = createApp(App);

// Setup Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Setup Vue Router
app.use(router);

// Setup Google Analytics
if (import.meta.env.VITE_GA_TRACKING_ID) {
  app.use(createGtag({
    config: {
      id: import.meta.env.VITE_GA_TRACKING_ID,
    },
  }, router));
}

app.mount('#root');

