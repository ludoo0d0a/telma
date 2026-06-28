<template>
  <div class="train-station">
    <div class="directions">
      <button
        type="button"
        :class="['directions__departures', { 'directions__departures--active': departureMode }]"
        @click="setDepartureMode(true)"
        @keypress="setDepartureMode(true)"
      >
        Départs
      </button>
      <button
        type="button"
        :class="['directions__arrivals', { 'directions__arrivals--active': !departureMode }]"
        @click="setDepartureMode(false)"
        @keypress="setDepartureMode(false)"
      >
        Arrivées
      </button>
    </div>
    <Departures v-if="departureMode" />
    <Arrivals v-if="!departureMode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Arrivals from './Arrivals.vue';
import Departures from './Departures.vue';

const departureMode = ref<boolean>(true);

const setDepartureMode = (value: boolean) => {
  departureMode.value = value;
};
</script>

