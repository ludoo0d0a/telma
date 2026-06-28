<template>
  <nav class="bottom-navbar" role="navigation" aria-label="main navigation">
    <div class="bottom-navbar-menu">
      <router-link to="/" class="bottom-navbar-item" exact-active-class="active">
        <span class="icon"><Home :size="20" /></span>
        <span class="bottom-navbar-item-label">Home</span>
      </router-link>
      <router-link to="/itinerary" class="bottom-navbar-item" active-class="active">
        <span class="icon"><Route :size="20" /></span>
        <span class="bottom-navbar-item-label">Trajet</span>
      </router-link>
      <router-link to="/schedules" class="bottom-navbar-item" active-class="active">
        <span class="icon"><Clock :size="20" /></span>
        <span class="bottom-navbar-item-label">Horaires</span>
      </router-link>
      <button class="bottom-navbar-item" @click="$emit('more-click')">
        <span class="icon"><MoreHorizontal :size="20" /></span>
        <span class="bottom-navbar-item-label">More</span>
      </button>
      <router-link to="/favorites" class="bottom-navbar-item" active-class="active">
        <span class="icon"><Star :size="20" /></span>
        <span class="bottom-navbar-item-label">Favoris</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Route, Clock, Star, MoreHorizontal } from 'lucide-vue-next';

defineEmits<{
  'more-click': [];
}>();
</script>

