<template>
  <div class="skytrip-search-card mb-6">
    <h2 class="title is-3 mb-4">
      <span class="icon mr-2">
        <component :is="icon" :size="24" />
      </span>
      {{ title }}
    </h2>
    <div :class="['columns', 'is-multiline', columnsWrapperClassName].filter(Boolean).join(' ')">
      <div
        v-for="card in cards"
        :key="card.path"
        :class="['column', columnsClass]"
      >
        <DashboardCard v-bind="card" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardCard from './DashboardCard.vue';

interface DashboardCardData {
  title: string;
  description: string;
  path: string;
  icon: any;
  color?: 'primary' | 'secondary';
}

interface Props {
  title: string;
  icon: any;
  cards: DashboardCardData[];
  columnsClass?: string;
  columnsWrapperClassName?: string;
}

withDefaults(defineProps<Props>(), {
  columnsClass: 'is-one-third-tablet is-half-mobile',
  columnsWrapperClassName: ''
});
</script>

