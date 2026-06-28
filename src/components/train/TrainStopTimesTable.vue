<template>
  <div v-if="stopTimes.length > 0" class="box">
    <h3 class="title is-4 mb-4">Arrêts et horaires</h3>
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Gare</th>
            <th>Horaire prévu</th>
            <th>Horaire réel</th>
            <th>Retard</th>
            <th>Quai/Voie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stop, index) in stopTimes" :key="index">
            <td>
              <strong>{{ getStopName(stop, index) }}</strong>
              <span v-if="index === 0" class="tag is-success is-dark ml-2">Départ</span>
              <span v-if="index === stopTimes.length - 1" class="tag is-danger is-dark ml-2">Arrivée</span>
            </td>
            <td>{{ getBaseTime(stop, index) }}</td>
            <td>
              <span v-if="getRealTime(stop, index) && getRealTime(stop, index) !== getBaseTime(stop, index)" class="has-text-danger">
                {{ getRealTime(stop, index) }}
              </span>
              <span v-else>{{ getBaseTime(stop, index) }}</span>
            </td>
            <td>
              <span v-if="getDelay(stop, index)" :class="getDelayClass(getDelay(stop, index))">
                {{ getDelay(stop, index) }}
              </span>
              <span v-else>—</span>
            </td>
            <td>{{ getPlatform(stop) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseUTCDate, formatTime } from '@/utils/dateUtils';
import { calculateDelay } from '@/services/delayService';
import type { ExtendedVehicleJourney } from './types';

interface Props {
  stopTimes: NonNullable<ExtendedVehicleJourney['stop_times']>;
}

const props = defineProps<Props>();

const getStopName = (stop: any, index: number): string => {
  const stopPoint = stop?.stop_point || {};
  const stopArea = stopPoint?.stop_area || {};
  return stopPoint?.name || stopArea?.name || 'Gare inconnue';
};

const getBaseTime = (stop: any, index: number): string => {
  const isLast = index === props.stopTimes.length - 1;
  const baseTime = isLast ? stop?.base_departure_date_time : stop?.base_arrival_date_time;
  return baseTime ? formatTime(parseUTCDate(baseTime)) : 'N/A';
};

const getRealTime = (stop: any, index: number): string | null => {
  const isLast = index === props.stopTimes.length - 1;
  const realTime = isLast ? stop?.departure_date_time : stop?.arrival_date_time;
  return realTime ? formatTime(parseUTCDate(realTime)) : null;
};

const getDelay = (stop: any, index: number): string | null => {
  const isLast = index === props.stopTimes.length - 1;
  const baseTime = isLast ? stop?.base_departure_date_time : stop?.base_arrival_date_time;
  const realTime = isLast ? stop?.departure_date_time : stop?.arrival_date_time;
  
  if (baseTime && realTime) {
    try {
      return calculateDelay(
        parseUTCDate(baseTime),
        parseUTCDate(realTime)
      );
    } catch (err) {
      return null;
    }
  }
  return null;
};

const getDelayClass = (delay: string | null): string => {
  if (!delay) return '';
  const delayMinutes = parseInt(delay.replace(/[^0-9]/g, ''));
  if (delayMinutes > 10) return 'has-text-danger';
  if (delayMinutes > 5) return 'has-text-warning';
  return '';
};

const getPlatform = (stop: any): string => {
  return stop?.stop_point?.label || 'N/A';
};
</script>

