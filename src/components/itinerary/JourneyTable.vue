<template>
  <div class="box">
    <h2 class="title is-4 mb-5">
      Trains disponibles <span class="tag is-primary is-medium">{{ journeys.length }}</span>
    </h2>
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Train</th>
            <th>Départ</th>
            <th>Arrivée</th>
            <th>Retard</th>
            <th>Perturbations</th>
            <th>Durée</th>
            <th>Wagons</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          <JourneyTableRow
            v-for="(journey, index) in journeys"
            :key="index"
            :journey="journey"
            :journey-info="getJourneyInfo(journey)"
            :journey-disruptions="getJourneyDisruptions(journey, getJourneyInfo(journey))"
            :trip-id="generateTripId(journey, getJourneyInfo(journey))"
            @detail-click="onDetailClick(journey, getJourneyInfo(journey), getJourneyDisruptions(journey, getJourneyInfo(journey)), generateTripId(journey, getJourneyInfo(journey)))"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import JourneyTableRow from './JourneyTableRow.vue';

interface Props {
  journeys: JourneyItem[];
  getJourneyInfo: (journey: JourneyItem) => JourneyInfo;
  getJourneyDisruptions: (journey: JourneyItem, journeyInfo: JourneyInfo) => Disruption[];
  generateTripId: (journey: JourneyItem, journeyInfo: JourneyInfo) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'detail-click': [journey: JourneyItem, journeyInfo: JourneyInfo, journeyDisruptions: Disruption[], tripId: string];
}>();

const onDetailClick = (journey: JourneyItem, journeyInfo: JourneyInfo, journeyDisruptions: Disruption[], tripId: string) => {
  emit('detail-click', journey, journeyInfo, journeyDisruptions, tripId);
};
</script>

