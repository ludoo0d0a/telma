<template>
  <div>
    <PageHeader title="City" :show-notification="false" />
    <main>
      <div class="container">
        <p>City page - Conversion in progress</p>
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { PageHeader } from '@/components/skytrip';
</script>

