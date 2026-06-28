<template>
  <div class="level mb-5">
    <div class="level-left">
      <div class="level-item">
        <h1 class="title is-2">Détails du train</h1>
        <span v-if="trainNumber && trainNumber !== 'N/A'" class="ml-3 tag is-primary is-large">
          {{ trainNumber }}
        </span>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <button
          class="button is-primary mr-2"
          @click="$emit('refresh')"
          :disabled="refreshing"
        >
          <span class="icon">
            <Loader2 v-if="refreshing" :size="16" class="animate-spin" />
            <RefreshCw v-else :size="16" />
          </span>
          <span>{{ refreshing ? 'Actualisation...' : 'Actualiser' }}</span>
        </button>
        <RouterLink to="/train" class="button is-light">
          <span class="icon"><Search :size="16" /></span>
          <span>Rechercher</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Loader2, RefreshCw } from 'lucide-vue-next';

interface Props {
  trainNumber: string;
  refreshing: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
}>();
</script>

