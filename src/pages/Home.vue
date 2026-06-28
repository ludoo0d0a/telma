<template>
  <div class="app-flight">
    <PageHeader
      title="Dashboard"
      subtitle="Accédez rapidement aux principales fonctionnalités"
      :show-notification="false"
    />

    <main>
      <!-- Authentication Section -->
      <!--<AuthenticationSection />-->

      <!-- Current Location Widget -->
      <CurrentLocationSection />

      <!-- Advertisement -->
      <Ad format="horizontal" size="responsive" class="mb-6" />

      <!-- Main Pages Section -->
      <DashboardSection
        title="Pages Principales"
        :icon="LayoutGrid"
        :cards="mainPages"
        columns-wrapper-class-name="is-mobile"
      />

      <!-- Advertisement -->
      <Ad format="horizontal" size="responsive" class="mb-6" />

      <!-- Sample Routes Section -->
      <DashboardSection
        title="Exemples de Trajets"
        :icon="Route"
        :cards="sampleRoutes"
        columns-class="is-half-tablet is-half-mobile"
      />

      <!-- Advertisement -->
      <Ad format="horizontal" size="responsive" class="mb-6" />

      <!-- Sample Trips Section -->
      <DashboardSection
        title="Exemples de Trajets Détaillés"
        :icon="List"
        :cards="sampleTrips"
        columns-class="is-half-tablet is-full-mobile"
      />

      <!-- Advertisement -->
      <Ad format="horizontal" size="responsive" class="mb-6" />

      <!-- API Documentation Section -->
      <DashboardSection
        title="Documentation"
        :icon="Code"
        :cards="apiDocs"
        columns-class="is-half-tablet is-half-mobile"
      />

      <!-- Advertisement -->
      <Ad format="auto" size="responsive" class="mb-6" />
    </main>
    <!--<Footer />-->
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Route, List, Code, Train, MapPin, Clock, BarChart3, Map, Circle, Star, Bus, ArrowRight, Bookmark, Book } from 'lucide-vue-next';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad.vue';
import AuthenticationSection from '@/components/home/AuthenticationSection.vue';
import CurrentLocationSection from '@/components/home/CurrentLocationSection.vue';
import DashboardSection from '@/components/home/DashboardSection.vue';
import type { Component } from 'vue';

interface DashboardCard {
  title: string;
  description: string;
  path: string;
  icon: Component;
  color?: 'primary' | 'secondary';
}

const mainPages: DashboardCard[] = [
  {
    title: 'Train',
    description: 'Rechercher et suivre les trains',
    path: '/train',
    icon: Train,
    color: 'primary',
  },
  {
    title: 'Places',
    description: 'Rechercher des lieux et gares',
    path: '/places',
    icon: MapPin,
  },
  {
    title: 'Lignes',
    description: 'Explorer les lignes de transport',
    path: '/lines',
    icon: Route,
  },
  {
    title: 'Horaires',
    description: 'Consulter les horaires',
    path: '/schedules',
    icon: Clock,
  },
  {
    title: 'Rapports',
    description: 'Voir les rapports et statistiques',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Couverture',
    description: 'Carte de couverture du réseau',
    path: '/coverage',
    icon: Map,
  },
  {
    title: 'Isochrones',
    description: 'Visualiser les isochrones',
    path: '/isochrones',
    icon: Circle,
  },
  {
    title: 'Favoris',
    description: 'Vos favoris sauvegardés',
    path: '/favorites',
    icon: Star,
  },
  {
    title: 'Modes Commerciaux',
    description: 'Types de transport disponibles',
    path: '/commercial-modes',
    icon: Bus,
  },
];

const sampleRoutes: DashboardCard[] = [
  {
    title: 'Bettembourg → Metz',
    description: 'Exemple de trajet',
    path: '/itinerary/bettembourg/metz',
    icon: ArrowRight,
    color: 'secondary',
  },
  {
    title: 'Metz → Thionville',
    description: 'Exemple de trajet',
    path: '/itinerary/metz/thionville',
    icon: ArrowRight,
    color: 'secondary',
  },
  {
    title: 'Choose your trip',
    description: 'Sample 1',
    path: '/sample1',
    icon: ArrowRight,
    color: 'secondary',
  },
  {
    title: 'Saved Flights',
    description: 'Sample 2',
    path: '/sample2',
    icon: Bookmark,
    color: 'secondary',
  },
  {
    title: 'Select Flight',
    description: 'Sample 3',
    path: '/sample3',
    icon: Bookmark,
    color: 'secondary',
  },
];

const sampleTrips: DashboardCard[] = [
  {
    title: 'Train SNCF 88769',
    description: 'Exemple de trajet détaillé - 18 décembre 2025',
    path: '/trip/dmVoaWNsZV9qb3VybmV5OlNOQ0Y6MjAyNS0xMi0xODo4ODc2OT',
    icon: Train,
    color: 'secondary',
  },
  {
    title: 'Train SNCF 88786',
    description: 'Exemple de trajet détaillé - 19 décembre 2025',
    path: '/trip/dmVoaWNsZV9qb3VybmV5OlNOQ0Y6MjAyNS0xMi0xOTo4ODc4Nj',
    icon: Train,
    color: 'secondary',
  },
];

const apiDocs: DashboardCard[] = [
  {
    title: 'API Documentation',
    description: 'Documentation Swagger de l\'API',
    path: '/api-docs',
    icon: Book,
    color: 'primary',
  },
];
</script>

