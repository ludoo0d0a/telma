<template>
  <div class="column is-half-tablet is-one-third-desktop is-half-mobile">
    <div class="box">
      <h3 class="title is-5 mb-3">
        {{ mode.name || 'Non spécifié' }}
      </h3>
      <div class="content">
        <p><strong>ID:</strong> <code>{{ mode.id }}</code></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommercialMode } from '@/client/models/commercial-mode';

interface Props {
  mode: CommercialMode;
}

defineProps<Props>();
</script>

