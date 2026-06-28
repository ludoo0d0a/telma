<template>
  <div class="app-flight">
    <PageHeader
      title="Good morning!"
      subtitle="Planifiez vos vols du jour"
      back-url="/"
      :show-notification="true"
      :has-pending-notifications="true"
    />
    <main>
      <div class="box has-text-centered">
        <p class="title is-4">Sample 1</p>
        <p class="subtitle is-6">This page is being converted to Vue. Please check back soon.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/skytrip/PageHeader.vue';
</script>

