<template>
  <RouterLink :to="path" class="dashboard-card-link">
    <div
      :class="[
        'card',
        'dashboard-card',
        {
          'has-background-primary': color === 'primary',
          'has-background-secondary': color === 'secondary'
        }
      ]"
    >
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <span :class="['icon', 'is-large', { 'has-text-white': color }]">
              <component :is="icon" :size="32" />
            </span>
          </div>
          <div class="media-content">
            <p :class="['title', 'is-5', { 'has-text-white': color }]">
              {{ title }}
            </p>
            <p :class="['subtitle', 'is-6', color ? 'has-text-white' : 'has-text-secondary']">
              {{ description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  path: string;
  icon: any;
  color?: 'primary' | 'secondary';
}

defineProps<Props>();
</script>

