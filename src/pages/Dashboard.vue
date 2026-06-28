<template>
  <div class="app-flight">
    <PageHeader
      title="Dashboard"
      subtitle="Accédez rapidement aux principales fonctionnalités"
      :show-notification="false"
    />
    <main>
      <div class="container" style="padding: 20px">
        <h2 class="title is-2">Your Dashboard</h2>
        <h3 class="title is-4">Favorite Stations</h3>
        <div class="columns is-multiline">
          <div
            v-for="(station, index) in favoriteStations"
            :key="index"
            class="column is-one-third"
          >
            <div class="box">
              <p class="title is-5">{{ station.name }}</p>
              <p class="subtitle is-6">{{ station.city }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/skytrip/PageHeader.vue';

const favoriteStations = [
  { name: 'Gare de Lyon', city: 'Paris' },
  { name: 'Gare du Nord', city: 'Paris' },
  { name: 'Gare de Marseille-Saint-Charles', city: 'Marseille' },
];
</script>

