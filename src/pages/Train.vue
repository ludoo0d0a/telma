<template>
  <div>
    <PageHeader
      title="Train"
      subtitle="Rechercher et suivre les trains"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="box has-text-centered">
          <p class="title is-4">Train</p>
          <p class="subtitle is-6">This page is being converted to Vue. Please check back soon.</p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import PageHeader from '@/components/skytrip/PageHeader.vue';
import Footer from '@/components/Footer.vue';

const route = useRoute();
// Access route params: route.params.id
</script>

