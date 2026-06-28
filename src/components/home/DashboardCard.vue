<template>
  <RouterLink :to="path" class="dashboard-card-link">
    <div :class="['card', 'dashboard-card', colorClass]">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <span :class="['icon', 'is-large', textColorClass]">
              <component :is="icon" :size="32" />
            </span>
          </div>
          <div class="media-content">
            <p :class="['title', 'is-5', textColorClass]">
              {{ title }}
            </p>
            <p :class="['subtitle', 'is-6', subtitleColorClass]">
              {{ description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';

interface Props {
  title: string;
  description: string;
  path: string;
  icon: Component;
  color?: 'primary' | 'secondary';
}

const props = defineProps<Props>();

const colorClass = computed(() => {
  if (props.color === 'primary') return 'has-background-primary';
  if (props.color === 'secondary') return 'has-background-secondary';
  return '';
});

const textColorClass = computed(() => (props.color ? 'has-text-white' : ''));
const subtitleColorClass = computed(() => (props.color ? 'has-text-white' : 'has-text-secondary'));
</script>

