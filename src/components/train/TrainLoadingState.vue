<template>
  <section class="section">
    <div class="container">
      <div class="box has-text-centered">
        <span class="icon is-large">
          <Loader2 :size="48" class="animate-spin" />
        </span>
        <p class="mt-4">Chargement des détails du train...</p>
      </div>
    </div>
  </section>
  <Footer />
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
</script>

