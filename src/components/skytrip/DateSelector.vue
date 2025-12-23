<template>
  <div class="date-selector">
    <div class="date-selector-scroll">
      <button
        v-for="date in dates"
        :key="date.full"
        :class="['date-button', { 'is-active': selectedDate === date.full }]"
        @click="$emit('date-select', date.full)"
      >
        <span class="date-day">{{ date.day }}</span>
        <span class="date-number">{{ date.date }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateItem {
  day: string;
  date: string;
  full: string;
}

interface Props {
  dates: DateItem[];
  selectedDate: string;
}

defineProps<Props>();

defineEmits<{
  'date-select': [date: string];
}>();
</script>

