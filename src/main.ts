import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createGtag } from 'vue-gtag';
import '@/styles/index.scss';
import App from '@/App.vue';
import { initGA } from '@/utils/analytics';
import { provideAuth } from '@/composables/useAuth';
import { provideSidebar } from '@/composables/useSidebar';
import routes from '@/router';

// Initialize Google Analytics
initGA();

// Log environment variables for verification
console.log('Environment Variables Check:');
console.log('VITE_GOOGLE_ADSENSE_ID:', import.meta.env.VITE_GOOGLE_ADSENSE_ID);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SHOW_ADS:', import.meta.env.VITE_SHOW_ADS);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Track page views
router.afterEach((to) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
      page_path: to.path + to.search,
    });
  }
});

const app = createApp(App);

// Provide composables
app.provide('googleClientId', googleClientId);
provideAuth(app);
provideSidebar(app);

// Use router
app.use(router);

// Use Google Analytics
if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
  app.use(createGtag({
    config: {
      id: import.meta.env.VITE_GA_MEASUREMENT_ID,
    },
  }, router));
}

// Load Google Identity Services script for OAuth
if (googleClientId && typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

app.mount('#root');

