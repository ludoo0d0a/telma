<template>
  <div :class="['flight-card', `flight-card--${variant}`]">
    <div v-if="header" class="flight-card-header">
      <component :is="header" />
    </div>
    <div class="flight-card-body">
      <div class="flight-route">
        <div class="flight-from">
          <p class="flight-code">{{ from.code }}</p>
          <p class="flight-city">{{ from.city }}</p>
          <p class="flight-time">{{ departureTime }}</p>
        </div>
        <div class="flight-connector">
          <p class="flight-duration">{{ duration }}</p>
        </div>
        <div class="flight-to">
          <p class="flight-code">{{ to.code }}</p>
          <p class="flight-city">{{ to.city }}</p>
          <p class="flight-time">{{ arrivalTime }}</p>
        </div>
      </div>
      <div v-if="airline" class="flight-airline">{{ airline }}</div>
      <div v-if="price" class="flight-price">{{ price }}</div>
    </div>
    <div v-if="footer" class="flight-card-footer">
      <component :is="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Location {
  code: string;
  city: string;
}

interface Props {
  from: Location;
  to: Location;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  airline?: string;
  price?: string;
  variant?: 'default' | 'saved' | 'detailed';
  showTimeline?: boolean;
  header?: any;
  footer?: any;
  flightType?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  showTimeline: true
});
</script>

