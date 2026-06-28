import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import '@/styles/index.scss';
import { initGA } from '@/utils/analytics';
import VueGtag from 'vue-gtag';

// Initialize Google Analytics
initGA();

// Log environment variables for verification
console.log('Environment Variables Check:');
console.log('VITE_GOOGLE_ADSENSE_ID:', import.meta.env.VITE_GOOGLE_ADSENSE_ID);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SHOW_ADS:', import.meta.env.VITE_SHOW_ADS);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Setup Google Analytics
if (gaTrackingId) {
  app.use(VueGtag, {
    config: {
      id: gaTrackingId,
      params: {
        send_page_view: false, // We handle this manually
      },
    },
  }, router);
}

// Setup Google OAuth (if needed)
// Note: vue3-google-oauth2 setup would go here if needed

app.mount('#app');

