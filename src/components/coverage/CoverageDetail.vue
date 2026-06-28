<template>
  <div class="box">
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <button
            class="button is-light"
            @click="$emit('back')"
          >
            <span class="icon"><ArrowLeft :size="20" /></span>
            <span>Retour à la liste</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <h2 class="title is-3">Détails: {{ selectedCoverage.id }}</h2>
        </div>
      </div>
      <div v-if="selectedCoverage.status" class="level-right">
        <div class="level-item">
          <component :is="getStatusBadge(selectedCoverage.status)" />
        </div>
      </div>
    </div>

    <div class="content">
      <div class="box mb-5">
        <h3 class="title is-5 mb-4">Informations générales</h3>
        <div class="content">
          <p v-if="selectedCoverage.id"><strong>ID:</strong> <code>{{ selectedCoverage.id }}</code></p>
          <p v-if="selectedCoverage.start_production_date">
            <strong>Date de début de production:</strong> {{ formatDateString(selectedCoverage.start_production_date) }}
          </p>
          <p v-if="selectedCoverage.end_production_date">
            <strong>Date de fin de production:</strong> {{ formatDateString(selectedCoverage.end_production_date) }}
          </p>
          <p v-if="selectedCoverage.status"><strong>Statut:</strong> {{ selectedCoverage.status }}</p>
        </div>
      </div>

      <div v-if="selectedCoverage.shape" class="box mb-5">
        <h3 class="title is-5 mb-4">Forme géographique</h3>
        <div class="content">
          <pre>{{ selectedCoverage.shape }}</pre>
        </div>
      </div>

      <CoverageContext v-if="selectedCoverage.context" :context="selectedCoverage.context" />

      <CoverageLinks v-if="selectedCoverage.links && selectedCoverage.links.length > 0" :links="selectedCoverage.links" />

      <div class="box">
        <details>
          <summary class="title is-6 mb-4" style="cursor: pointer">Afficher les données JSON brutes</summary>
          <div class="content mt-4">
            <pre :style="{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '1.5rem',
              overflow: 'auto',
              color: '#ccc',
              fontFamily: '\'Roboto Mono\', monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }">{{ JSON.stringify(selectedCoverage, null, 2) }}</pre>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import type { Context } from '@/client/models/context';
import type { Link } from '@/client/models/link';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';
import CoverageContext from './CoverageContext.vue';
import CoverageLinks from './CoverageLinks.vue';

interface SelectedCoverage extends Coverage {
  id: string;
  context?: Context;
  links?: Link[];
}

interface Props {
  selectedCoverage: SelectedCoverage;
}

defineProps<Props>();

defineEmits<{
  back: [];
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

