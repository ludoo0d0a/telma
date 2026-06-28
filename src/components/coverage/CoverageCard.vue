<template>
  <div class="column is-half-tablet is-one-third-desktop">
    <div
      class="box is-clickable"
      @click="$emit('click', coverage.id)"
      style="cursor: pointer"
    >
      <h3 class="title is-5 mb-3">{{ coverage.id }}</h3>
      <div class="content">
        <div class="mb-3">
          <component :is="getStatusBadge(coverage.status)" />
        </div>
        <p v-if="coverage.start_production_date">
          <strong>Début:</strong> {{ formatDateString(coverage.start_production_date) }}
        </p>
        <p v-if="coverage.end_production_date">
          <strong>Fin:</strong> {{ formatDateString(coverage.end_production_date) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';

interface Props {
  coverage: Coverage;
}

defineProps<Props>();

defineEmits<{
  click: [coverageId: string | undefined];
}>();

const getStatusBadge = (status: string | undefined) => {
  if (status === 'running') {
    return h('span', { class: 'tag is-success' }, 'En cours');
  } else if (status === 'closed') {
    return h('span', { class: 'tag is-danger' }, 'Fermé');
  }
  return h('span', { class: 'tag is-light' }, status || 'N/A');
};
</script>

