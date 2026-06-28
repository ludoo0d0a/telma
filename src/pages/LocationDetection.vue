<template>
  <div>
    <PageHeader title="Location Detection" :show-notification="false" />
    <main>
      <div class="container">
        <p>Location Detection page - Conversion in progress (needs react-map-gl conversion)</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { PageHeader } from '@/components/skytrip';

export const DEFAULT_RADIUS_NEARBY = 5000;
export const DEFAULT_RADIUS_NEARBY_LARGE = 10000;
</script>

