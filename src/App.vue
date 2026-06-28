<template>
  <div class="App">
    <Sidebar :is-open="isOpen" @close="closeSidebar" />
    <RouterView />
    <BottomNavbar @more-click="toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { useSidebar } from '@/composables/useSidebar';
import Sidebar from '@/components/Sidebar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
</script>

