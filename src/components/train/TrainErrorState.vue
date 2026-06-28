<template>
  <section class="section">
    <div class="container">
      <div class="box has-text-centered">
        <span class="icon is-large has-text-danger">
          <AlertTriangle :size="48" />
        </span>
        <p class="mt-4 has-text-danger">{{ error || 'Train non trouvé' }}</p>
        <div class="buttons is-centered mt-4">
          <button
            class="button is-primary"
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
            Rechercher un autre train
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
  <Footer />
</template>

<script setup lang="ts">
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';

interface Props {
  error: string | null;
  refreshing: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
}>();
</script>

