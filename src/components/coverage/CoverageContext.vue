<template>
  <div class="box mb-5">
    <h2 class="title is-4 mb-4">Contexte</h2>
    <div class="content">
      <p v-if="context.timezone"><strong>Fuseau horaire:</strong> {{ context.timezone }}</p>
      <p v-if="context.current_datetime">
        <strong>Date/heure actuelle:</strong> {{ formatDateTimeString(context.current_datetime) }}
      </p>
      <div v-if="context.car_direct_path">
        <strong>Chemin direct en voiture:</strong>
        <p v-if="context.car_direct_path.co2_emission">
          CO₂: {{ context.car_direct_path.co2_emission.value }} {{ context.car_direct_path.co2_emission.unit }}
        </p>
        <div v-if="context.car_direct_path.air_pollutants">
          <p>Polluants atmosphériques:</p>
          <ul>
            <li v-if="context.car_direct_path.air_pollutants.values?.nox !== undefined">
              NOx: {{ context.car_direct_path.air_pollutants.values.nox }} {{ context.car_direct_path.air_pollutants.unit }}
            </li>
            <li v-if="context.car_direct_path.air_pollutants.values?.pm !== undefined">
              PM: {{ context.car_direct_path.air_pollutants.values.pm }} {{ context.car_direct_path.air_pollutants.unit }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Context } from '@/client/models/context';
import { formatDateTimeString } from '@/utils/dateUtils';

interface Props {
  context: Context;
}

defineProps<Props>();
</script>

