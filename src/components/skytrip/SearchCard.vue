<template>
  <div class="search-card">
    <div class="tabs-container">
      <Tabs
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="$emit('tab-change', $event)"
      />
    </div>
    <button class="button is-primary" @click="$emit('search')">
      Search
    </button>
  </div>
</template>

<script setup lang="ts">
import Tabs from './Tabs.vue';

interface Tab {
  label: string;
  value: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (value: string) => void;
}

defineProps<Props>();

defineEmits<{
  'tab-change': [value: string];
  'search': [];
}>();
</script>

