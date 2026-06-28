import { createRouter, createWebHistory } from 'vue-router';
import { trackPageView } from '@/utils/analytics';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue'),
    },
    {
      path: '/commercial-modes',
      name: 'CommercialModes',
      component: () => import('@/pages/CommercialModes.vue'),
    },
    {
      path: '/coverage',
      name: 'Coverage',
      component: () => import('@/pages/Coverage.vue'),
    },
    {
      path: '/places',
      name: 'Places',
      component: () => import('@/pages/Places.vue'),
    },
    {
      path: '/schedules',
      name: 'Schedules',
      component: () => import('@/pages/Schedules.vue'),
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/pages/Reports.vue'),
    },
    {
      path: '/lines',
      name: 'Lines',
      component: () => import('@/pages/Lines.vue'),
    },
    {
      path: '/isochrones',
      name: 'Isochrones',
      component: () => import('@/pages/Isochrones.vue'),
    },
    {
      path: '/api-docs',
      name: 'SwaggerUI',
      component: () => import('@/pages/SwaggerUI.vue'),
    },
    {
      path: '/itinerary',
      name: 'Trajet',
      component: () => import('@/pages/Trajet.vue'),
    },
    {
      path: '/itinerary/:from/:to',
      name: 'TrajetWithParams',
      component: () => import('@/pages/Trajet.vue'),
    },
    {
      path: '/train/:id',
      name: 'TrainWithId',
      component: () => import('@/pages/Train.vue'),
    },
    {
      path: '/train',
      name: 'Train',
      component: () => import('@/pages/Train.vue'),
    },
    {
      path: '/trip/:tripId',
      name: 'Trip',
      component: () => import('@/pages/Trip.vue'),
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/pages/Favorites.vue'),
    },
    {
      path: '/location-detection',
      name: 'LocationDetection',
      component: () => import('@/pages/LocationDetection.vue'),
    },
    {
      path: '/city/:city',
      name: 'City',
      component: () => import('@/pages/City.vue'),
      children: [
        {
          path: ':codeStation',
          name: 'TrainStation',
          component: () => import('@/components/TrainStation.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/pages/About.vue'),
    },
    {
      path: '/sample1',
      name: 'Sample1',
      component: () => import('@/pages/Sample1.vue'),
    },
    {
      path: '/sample2',
      name: 'Sample2',
      component: () => import('@/pages/Sample2.vue'),
    },
    {
      path: '/sample3',
      name: 'Sample3',
      component: () => import('@/pages/Sample3.vue'),
    },
    {
      path: '/stats',
      name: 'Stats',
      component: () => import('@/pages/Stats.vue'),
    },
    {
      path: '/raise-issue',
      name: 'RaiseIssue',
      component: () => import('@/pages/RaiseIssue.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.afterEach((to) => {
  const queryString = to.fullPath.includes('?') ? '?' + to.fullPath.split('?')[1] : '';
  trackPageView(to.path + queryString);
});

export default router;

