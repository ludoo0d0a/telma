<template>
  <div class="container">
    <p>Train Station page - to be implemented</p>
    <p v-if="codeStation">Station Code: {{ codeStation }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const codeStation = route.params.codeStation as string | undefined;
</script>

