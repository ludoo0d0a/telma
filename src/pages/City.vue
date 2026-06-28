<template>
  <div>
    <PageHeader
      :title="`Gares de ${cityName}`"
      subtitle="Découvrez les stations et horaires disponibles"
      :show-notification="false"
    />
    <div class="city">
      <h2 class="city__name">{{ cityName }}</h2>
      <TrainStations :stations="stationsData" />
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import TrainStations from '@/components/TrainStations.vue';
import stations from '@/gares.json';

const route = useRoute();
const city = route.params.city as string | undefined;
const cityName = computed(() => city ? city.replace(/-/g, ' ') : 'Ville');
const stationsData = computed(() => {
  if (!city) return undefined;
  return (stations as Record<string, Record<string, string>>)[city];
});
</script>
