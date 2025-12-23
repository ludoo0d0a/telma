<template>
  <nav class="bottom-navbar" role="navigation" aria-label="main navigation">
    <div class="bottom-navbar-menu">
      <RouterLink to="/" end class="bottom-navbar-item">
        <span class="icon"><Home :size="20" /></span>
        <span class="bottom-navbar-item-label">Home</span>
      </RouterLink>
      <RouterLink to="/itinerary" class="bottom-navbar-item">
        <span class="icon"><Route :size="20" /></span>
        <span class="bottom-navbar-item-label">Trajet</span>
      </RouterLink>
      <RouterLink to="/schedules" class="bottom-navbar-item">
        <span class="icon"><Clock :size="20" /></span>
        <span class="bottom-navbar-item-label">Horaires</span>
      </RouterLink>
      <button class="bottom-navbar-item" @click="$emit('more-click')">
        <span class="icon"><MoreHorizontal :size="20" /></span>
        <span class="bottom-navbar-item-label">More</span>
      </button>
      <RouterLink to="/favorites" class="bottom-navbar-item">
        <span class="icon"><Star :size="20" /></span>
        <span class="bottom-navbar-item-label">Favoris</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Route, Clock, Star, MoreHorizontal } from 'lucide-vue-next';

defineEmits<{
  'more-click': [];
}>();
</script>

