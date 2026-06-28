<template>
  <div class="App">
    <Sidebar :is-open="isOpen" @close="closeSidebar" />
    <RouterView />
    <BottomNavbar @more-click="toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { trackPageView } from '@/utils/analytics';
import BottomNavbar from '@/components/BottomNavbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useSidebarProvider } from '@/composables/useSidebar';
import { useAuthProvider } from '@/composables/useAuth';

// Setup providers
useAuthProvider();
const { isOpen, toggleSidebar, closeSidebar } = useSidebarProvider();

const route = useRoute();

// Track page views on route changes
watch(() => route.path, (path) => {
  trackPageView(path + (route.query ? '?' + new URLSearchParams(route.query as Record<string, string>).toString() : ''));
}, { immediate: true });
</script>

