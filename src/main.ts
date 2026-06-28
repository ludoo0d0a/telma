import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import '@/styles/index.scss';
import App from '@/App.vue';
import { initGA } from '@/utils/analytics';
import { useAuthProvider } from '@/composables/useAuth';
import { useSidebarProvider } from '@/composables/useSidebar';

// Import pages
import Home from '@/pages/Home.vue';
import City from '@/pages/City.vue';
import TrainStation from '@/components/TrainStation.vue';
import CommercialModes from '@/pages/CommercialModes.vue';
import Coverage from '@/pages/Coverage.vue';
import Places from '@/pages/Places.vue';
import Schedules from '@/pages/Schedules.vue';
import Reports from '@/pages/Reports.vue';
import Lines from '@/pages/Lines.vue';
import Isochrones from '@/pages/Isochrones.vue';
import SwaggerUIPage from '@/pages/SwaggerUI.vue';
import Trajet from '@/pages/Trajet.vue';
import Favorites from '@/pages/Favorites.vue';
import Train from '@/pages/Train.vue';
import Trip from '@/pages/Trip.vue';
import About from '@/pages/About.vue';
import LocationDetection from '@/pages/LocationDetection.vue';
import Sample1 from '@/pages/Sample1.vue';
import Sample2 from '@/pages/Sample2.vue';
import Sample3 from '@/pages/Sample3.vue';
import Stats from '@/pages/Stats.vue';
import RaiseIssue from '@/pages/RaiseIssue.vue';
import Dashboard from '@/pages/Dashboard.vue';

// Initialize Google Analytics
initGA();

// Log environment variables for verification
console.log('Environment Variables Check:');
console.log('VITE_GOOGLE_ADSENSE_ID:', import.meta.env.VITE_GOOGLE_ADSENSE_ID);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SHOW_ADS:', import.meta.env.VITE_SHOW_ADS);

const routes = [
  { path: '/', component: Home },
  { path: '/commercial-modes', component: CommercialModes },
  { path: '/coverage', component: Coverage },
  { path: '/places', component: Places },
  { path: '/schedules', component: Schedules },
  { path: '/reports', component: Reports },
  { path: '/lines', component: Lines },
  { path: '/isochrones', component: Isochrones },
  { path: '/api-docs', component: SwaggerUIPage },
  { path: '/itinerary', component: Trajet },
  { path: '/itinerary/:from/:to', component: Trajet },
  { path: '/train/:id', component: Train },
  { path: '/train', component: Train },
  { path: '/trip/:tripId', component: Trip },
  { path: '/favorites', component: Favorites },
  { path: '/location-detection', component: LocationDetection },
  {
    path: '/city/:city',
    component: City,
    children: [
      { path: ':codeStation', component: TrainStation }
    ]
  },
  { path: '/about', component: About },
  { path: '/sample1', component: Sample1 },
  { path: '/sample2', component: Sample2 },
  { path: '/sample3', component: Sample3 },
  { path: '/stats', component: Stats },
  { path: '/raise-issue', component: RaiseIssue },
  { path: '/dashboard', component: Dashboard },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Track page views
router.afterEach((to) => {
  import('@/utils/analytics').then(({ trackPageView }) => {
    trackPageView(to.path + (to.query ? '?' + new URLSearchParams(to.query as Record<string, string>).toString() : ''));
  });
});

const app = createApp(App);

// Setup providers
app.use(router);

// Provide auth and sidebar context at app level - these are set up in App.vue
app.mount('#app');

