<template>
  <div class="tabs-container">
    <div :class="['tabs', variant === 'rounded' ? 'is-rounded' : '']">
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ 'is-active': activeTab === tab.value }"
        >
          <a @click="$emit('tab-change', tab.value)">{{ tab.label }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  label: string;
  value: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  variant?: 'default' | 'rounded';
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
});

defineEmits<{
  'tab-change': [value: string];
}>();
</script>

