import { RouteRecordRaw } from 'vue-router';
import Home from '@/pages/Home.vue';
import City from '@/pages/City.vue';
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
import TrainStation from '@/components/TrainStation.vue';

const routes: RouteRecordRaw[] = [
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
      { path: ':codeStation', component: TrainStation },
    ],
  },
  { path: '/about', component: About },
  { path: '/sample1', component: Sample1 },
  { path: '/sample2', component: Sample2 },
  { path: '/sample3', component: Sample3 },
  { path: '/stats', component: Stats },
  { path: '/raise-issue', component: RaiseIssue },
  { path: '/dashboard', component: Dashboard },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export default routes;

