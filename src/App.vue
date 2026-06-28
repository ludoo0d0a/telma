<template>
  <div class="App">
    <Sidebar :is-open="isOpen" :on-close="closeSidebar" />
    <RouterView />
    <BottomNavbar :on-more-click="toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { trackPageView } from '@/utils/analytics';
import BottomNavbar from '@/components/BottomNavbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useSidebar } from '@/composables/useSidebar';

const route = useRoute();
const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

// Track page view on route change
watch(
  () => route.path + route.query,
  (newPath) => {
    trackPageView(newPath);
  },
  { immediate: true }
);
</script>

