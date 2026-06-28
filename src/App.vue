<template>
  <div class="App">
    <Sidebar :is-open="isOpen" @close="closeSidebar" />
    <router-view />
    <BottomNavbar @more-click="toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';
import { useSidebar } from '@/composables/useSidebar';

const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

// Provide sidebar state to child components if needed
provide('sidebar', { isOpen, toggleSidebar, closeSidebar });
</script>

<style scoped>
.App {
  min-height: 100vh;
}
</style>

