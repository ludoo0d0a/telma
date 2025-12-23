<template>
  <footer class="footer has-background-primary has-text-white">
    <div class="content has-text-centered">
      <p class="has-text-white">
        <span>&copy;</span> {{ new Date().getFullYear() }} SNCF API Explorer
      </p>
      <p class="has-text-white is-size-7 mt-2">
        Powered by Navitia API
      </p>
      <p class="has-text-white is-size-7 mt-2">
        Version {{ packageJson.version }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import packageJson from '../../package.json';
</script>

