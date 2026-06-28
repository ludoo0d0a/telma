<template>
  <div class="train-stations">
    <p v-if="!stations || typeof stations !== 'object' || Object.keys(stations).length === 0" class="has-text-grey">
      Aucune gare disponible pour cette ville.
    </p>
    <RouterLink
      v-for="(code, stationName) in stations"
      :key="stationName"
      :to="code"
      :class="['train-stations__link', { 'train-stations__link--active': $route.path.includes(code) }]"
    >
      <span>{{ stationName }}</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stations?: Record<string, string> | null;
}

defineProps<Props>();
</script>

