<template>
  <div class="skytrip-search-card mb-6">
    <h2 class="title is-3 mb-4">
      <span class="icon mr-2">
        <Crosshair :size="24" />
      </span>
      Votre Position Actuelle
    </h2>
    <div class="columns">
      <div class="column is-full">
        <CurrentLocationWidget />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crosshair } from 'lucide-vue-next';
import CurrentLocationWidget from '@/components/CurrentLocationWidget.vue';
</script>

