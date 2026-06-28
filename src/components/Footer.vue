<template>
  <footer class="footer has-background-primary has-text-white">
    <div class="content has-text-centered">
      <p class="has-text-white">
        <span>&copy;</span> {{ currentYear }} SNCF API Explorer
      </p>
      <p class="has-text-white is-size-7 mt-2">
        Powered by Navitia API
      </p>
      <p class="has-text-white is-size-7 mt-2">
        Version {{ version }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import packageJson from '../../package.json';

const currentYear = computed(() => new Date().getFullYear());
const version = packageJson.version;
</script>

