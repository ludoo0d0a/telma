<template>
  <div v-if="links && links.length > 0" class="box mb-5">
    <h3 class="title is-5 mb-4">{{ title }}</h3>
    <div class="tags">
      <a
        v-for="(link, index) in links"
        :key="index"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="tag is-link is-medium"
      >
        {{ link.type || link.rel || 'Lien' }} {{ link.templated ? '(templated)' : '' }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Link } from '@/client/models/link';

interface Props {
  links: Link[];
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Liens disponibles'
});
</script>

