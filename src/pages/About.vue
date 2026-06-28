<template>
  <div>
    <PageHeader
      title="À propos"
      subtitle="SNCF API Explorer - horaires, trajets et outils open data"
      :show-notification="false"
    />
    <section class="section about-page">
      <div class="container">
        <!-- Version and Author -->
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-primary mr-2">
              <Tag :size="24" />
            </span>
            Version & Author
          </h2>
          <div class="content">
            <div class="columns">
              <div class="column is-half">
                <p>
                  <strong>Version:</strong>
                  <span class="tag is-primary is-medium ml-2">{{ packageJson.version }}</span>
                </p>
                <p class="mt-3">
                  <strong>Author:</strong>
                  <span class="ml-2">{{ packageJson.author }}</span>
                  <a
                    href="https://github.com/ludooo0d0a"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="has-text-primary ml-2"
                  >
                    (@ludooo0d0a)
                  </a>
                </p>
                <p class="mt-3">
                  <strong>Homepage:</strong>
                  <a
                    :href="packageJson.homepage"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="has-text-primary ml-2"
                  >
                    {{ packageJson.homepage }}
                  </a>
                </p>
              </div>
              <div class="column is-half">
                <p>
                  <strong>Repository:</strong>
                  <a
                    href="https://github.com/ludooo0d0a/telma"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="has-text-primary ml-2"
                  >
                    GitHub
                    <span class="icon ml-2">
                      <ExternalLink :size="16" />
                    </span>
                  </a>
                </p>
                <p class="mt-3">
                  <strong>API:</strong> SNCF Connect API (Navitia)
                </p>
                <p class="mt-3">
                  <strong>License:</strong> Check repository for license information
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Functional Features -->
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-primary mr-2">
              <Star :size="24" />
            </span>
            Functional Features
          </h2>
          <div class="columns is-multiline">
            <div v-for="(feature, index) in functionalFeatures" :key="index" class="column is-half-tablet is-full-mobile">
              <div class="media">
                <div class="media-left">
                  <span class="icon is-medium has-text-primary">
                    <component :is="feature.icon" :size="32" />
                  </span>
                </div>
                <div class="media-content">
                  <p class="title is-5">{{ feature.title }}</p>
                  <p class="subtitle is-6 has-text-secondary">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Features -->
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-primary mr-2">
              <Settings :size="24" />
            </span>
            Technical Features
          </h2>
          <div class="columns is-multiline">
            <div v-for="(feature, index) in technicalFeatures" :key="index" class="column is-half-tablet is-full-mobile">
              <div class="media">
                <div class="media-left">
                  <span class="icon is-medium has-text-primary">
                    <component :is="feature.icon" :size="32" />
                  </span>
                </div>
                <div class="media-content">
                  <p class="title is-5">{{ feature.title }}</p>
                  <p class="subtitle is-6 has-text-secondary">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Todo -->
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-warning mr-2">
              <CheckSquare :size="24" />
            </span>
            Todo
          </h2>
          <div class="content">
            <div v-for="(todo, index) in todos" :key="index" class="mb-4">
              <h3 class="title is-5">{{ todo.title }}</h3>
              <ul>
                <li v-for="(item, itemIndex) in todo.items" :key="itemIndex">
                  {{ item }}
                  <template v-if="todo.links && todo.links[itemIndex]">
                    - 
                    <a
                      :href="todo.links[itemIndex]"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="has-text-primary"
                    >
                      Link
                      <span class="icon ml-1 is-small">
                        <ExternalLink :size="16" />
                      </span>
                    </a>
                  </template>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Changelog -->
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-primary mr-2">
              <History :size="24" />
            </span>
            Changelog
          </h2>
          <div class="content">
            <div v-for="(entry, index) in changelog" :key="index" class="mb-5">
              <div class="level mb-3">
                <div class="level-left">
                  <div class="level-item">
                    <span class="tag is-primary is-large">{{ entry.version }}</span>
                  </div>
                  <div class="level-item">
                    <p class="subtitle is-6 has-text-grey">{{ entry.date }}</p>
                  </div>
                </div>
              </div>
              <ul>
                <li v-for="(change, changeIndex) in entry.changes" :key="changeIndex">{{ change }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Component } from 'vue';
import { Info, Tag, ExternalLink, Star, Settings, CheckSquare, History, Train, Route, MapPin, Bus, Map, Search, Circle, BarChart3, Book, Code, Network, Palette, BookOpen, Wrench, Smartphone, TrendingUp, FlaskConical } from 'lucide-vue-next';
import PageHeader from '@/components/skytrip/PageHeader.vue';
import Footer from '@/components/Footer.vue';
import packageJson from '../../package.json';

interface Feature {
  title: string;
  description: string;
  icon: Component;
}

const functionalFeatures: Feature[] = [
  {
    title: 'Real-time Train Information',
    description: 'View departures and arrivals for any train station',
    icon: Train
  },
  {
    title: 'Journey Planning',
    description: 'Search for journeys between different locations',
    icon: Route
  },
  {
    title: 'Station Explorer',
    description: 'Browse train stations by city with detailed information',
    icon: MapPin
  },
  {
    title: 'Commercial Modes',
    description: 'Explore different transportation modes available',
    icon: Bus
  },
  {
    title: 'Coverage Areas',
    description: 'View coverage information for different regions',
    icon: Map
  },
  {
    title: 'Places Search',
    description: 'Find train stations and places',
    icon: Search
  },
  {
    title: 'Lines Information',
    description: 'View train line details',
    icon: Route
  },
  {
    title: 'Isochrones',
    description: 'Visualize travel time zones from specific locations',
    icon: Circle
  },
  {
    title: 'Reports',
    description: 'Access detailed train reports',
    icon: BarChart3
  },
  {
    title: 'Favorites',
    description: 'Save and manage your favorite train stations',
    icon: Star
  },
  {
    title: 'Interactive API Documentation',
    description: 'Built-in Swagger UI for API exploration',
    icon: Book
  }
];

const technicalFeatures: Feature[] = [
  {
    title: 'Frontend Framework',
    description: 'Vue 3 with TypeScript for type-safe development',
    icon: Code
  },
  {
    title: 'Routing',
    description: 'Vue Router 4 for client-side navigation',
    icon: Route
  },
  {
    title: 'HTTP Client',
    description: 'Axios for making API calls to SNCF Connect API',
    icon: Network
  },
  {
    title: 'Styling',
    description: 'SCSS/Sass with Bulma CSS framework for responsive design',
    icon: Palette
  },
  {
    title: 'API Documentation',
    description: 'Swagger UI for interactive API exploration',
    icon: BookOpen
  },
  {
    title: 'Maps',
    description: 'MapLibre GL for interactive maps',
    icon: Map
  },
  {
    title: 'Build Tool',
    description: 'Vite 7.3.0 for fast development and optimized builds',
    icon: Wrench
  },
  {
    title: 'PWA Support',
    description: 'Progressive Web App capabilities with service workers',
    icon: Smartphone
  },
  {
    title: 'Analytics',
    description: 'Vue Gtag for page view tracking',
    icon: TrendingUp
  },
  {
    title: 'Testing',
    description: 'Vitest with Vue Test Utils',
    icon: FlaskConical
  }
];

const todos = [
  {
    title: 'Notifications from X (Twitter)',
    items: [
      'TER Nancy Metz Lux',
      'TER Metz Lux',
      'ITLF Lorraine Fron'
    ],
    links: [
      'https://x.com/TERNancyMetzLux',
      'https://x.com/TER_Metz_Lux',
      'https://x.com/itlflorfron'
    ]
  }
];

const changelog = [
  {
    version: '0.0.1',
    date: 'Initial Release',
    changes: [
      'Initial release of the SNCF API Explorer',
      'Real-time train information and journey planning',
      'Station explorer and favorites management',
      'Interactive maps with MapLibre GL',
      'PWA support with service workers',
      'Swagger UI integration for API documentation'
    ]
  }
];
</script>

