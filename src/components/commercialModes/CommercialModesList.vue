<template>
  <div v-if="modes.length === 0" class="has-text-centered">
    <p class="subtitle is-5">Aucun mode de transport trouvé</p>
  </div>
  <div v-else class="box">
    <h2 class="title is-4 mb-5">
      Modes disponibles <span class="tag is-primary is-medium">{{ modes.length }}</span>
    </h2>
    <div class="columns is-multiline">
      <CommercialModeCard
        v-for="mode in modes"
        :key="mode.id"
        :mode="mode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommercialMode } from '@/client/models/commercial-mode';
import CommercialModeCard from './CommercialModeCard.vue';

interface Props {
  modes: CommercialMode[];
}

defineProps<Props>();
</script>

