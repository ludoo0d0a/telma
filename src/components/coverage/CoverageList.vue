<template>
  <div class="box">
    <h2 class="title is-4 mb-5">
      Zones de couverture <span class="tag is-primary is-medium">{{ coverages.length }}</span>
    </h2>
    <div v-if="coverages.length === 0" class="has-text-centered">
      <p class="subtitle is-5">Aucune zone de couverture trouvée</p>
    </div>
    <div v-else class="columns is-multiline">
      <CoverageCard
        v-for="coverage in coverages"
        :key="coverage.id"
        :coverage="coverage"
        @click="$emit('coverage-click', $event)"
      />
    </div>

    <div v-if="coverageResponse?.links && coverageResponse.links.length > 0" class="mt-5">
      <h3 class="title is-5 mb-3">Liens disponibles</h3>
      <div class="tags">
        <a
          v-for="(link, index) in coverageResponse.links"
          :key="index"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="tag is-link is-medium"
        >
          {{ link.type || link.rel || 'Lien' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coverage, CoverageResponse } from '@/client/models';
import CoverageCard from './CoverageCard.vue';

interface Props {
  coverages: Coverage[];
  coverageResponse: CoverageResponse | null;
}

defineProps<Props>();

defineEmits<{
  'coverage-click': [coverageId: string | undefined];
}>();
</script>

