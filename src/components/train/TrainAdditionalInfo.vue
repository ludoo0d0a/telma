<template>
  <div class="box">
    <h3 class="title is-4 mb-4">Informations complémentaires</h3>
    <div class="content">
      <ul>
        <li><strong>ID du train:</strong> <code>{{ trainData.id }}</code></li>
        <li v-if="displayInfo.physical_mode">
          <strong>Mode de transport:</strong> {{ displayInfo.physical_mode }}
        </li>
        <li v-if="displayInfo.commercial_mode">
          <strong>Mode commercial:</strong> {{ displayInfo.commercial_mode }}
        </li>
        <li v-if="displayInfo.network">
          <strong>Réseau:</strong> {{ displayInfo.network }}
        </li>
        <template v-if="stopTimes.length > 0">
          <li><strong>Nombre d'arrêts:</strong> {{ stopTimes.length }}</li>
          <li>
            <strong>Gare de départ:</strong>
            {{ cleanLocationName(getFirstStopName()) }}
          </li>
          <li>
            <strong>Gare d'arrivée:</strong>
            {{ cleanLocationName(getLastStopName()) }}
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cleanLocationName } from '@/services/locationService';
import type { ExtendedVehicleJourney } from './types';
import type { DisplayInformation } from '@/client/models/display-information';

interface Props {
  trainData: ExtendedVehicleJourney;
  displayInfo: DisplayInformation;
  stopTimes: NonNullable<ExtendedVehicleJourney['stop_times']>;
}

const props = defineProps<Props>();

const getFirstStopName = (): string => {
  const firstStop = props.stopTimes[0];
  return firstStop?.stop_point?.name || firstStop?.stop_point?.stop_area?.name || 'N/A';
};

const getLastStopName = (): string => {
  const lastStop = props.stopTimes[props.stopTimes.length - 1];
  return lastStop?.stop_point?.name || lastStop?.stop_point?.stop_area?.name || 'N/A';
};
</script>

