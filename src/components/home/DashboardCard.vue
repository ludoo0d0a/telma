<template>
  <router-link :to="path" class="dashboard-card-link">
    <div :class="['card', 'dashboard-card', color === 'primary' ? 'has-background-primary' : color === 'secondary' ? 'has-background-secondary' : '']">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <span :class="['icon', 'is-large', color ? 'has-text-white' : '']">
              <component :is="icon" :size="32" />
            </span>
          </div>
          <div class="media-content">
            <p :class="['title', 'is-5', color ? 'has-text-white' : '']">
              {{ title }}
            </p>
            <p :class="['subtitle', 'is-6', color ? 'has-text-white' : 'has-text-secondary']">
              {{ description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { Component } from 'vue';

defineProps<{
  title: string;
  description: string;
  path: string;
  icon: Component;
  color?: 'primary' | 'secondary';
}>();
</script>

