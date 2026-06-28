<template>
  <div class="flight-list">
    <h3 v-if="title" class="title is-4">{{ title }}</h3>
    <div v-for="(flight, index) in flights" :key="index" class="flight-item">
      <FlightCard
        v-if="variant === 'detailed'"
        v-bind="flight"
        :variant="variant"
      />
      <div v-else class="flight-summary">
        <p>{{ flight.from.city }} → {{ flight.to.city }}</p>
        <p>{{ flight.departureTime }} - {{ flight.arrivalTime }}</p>
        <p v-if="flight.price">{{ flight.price }}</p>
      </div>
    </div>
    <a v-if="showSeeAll" class="button is-text">See All</a>
  </div>
</template>

<script setup lang="ts">
import FlightCard from './FlightCard.vue';

interface Flight {
  from: { code: string; city: string };
  to: { code: string; city: string };
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  airline?: string;
  price?: string;
}

interface Props {
  flights: Flight[];
  title?: string;
  showSeeAll?: boolean;
  variant?: 'default' | 'detailed';
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
});
</script>

