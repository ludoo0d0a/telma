<template>
  <tr>
    <td>
      <span class="tag is-dark has-text-weight-semibold">{{ formatDate(depDate, 'short') }}</span>
    </td>
    <td>
      <div>
        <div class="is-flex is-align-items-center mb-2">
          <span :class="['icon', journeyInfo.transportColor, 'mr-2']">
            <component :is="journeyInfo.transportIcon" :size="20" />
          </span>
          <RouterLink
            v-if="getTrainId()"
            :to="`/train/${encodeVehicleJourneyId(getTrainId()!)}`"
            class="has-text-primary has-text-weight-bold"
          >
            {{ journeyInfo.trainNumber }}
          </RouterLink>
          <strong v-else class="has-text-primary">{{ journeyInfo.trainNumber }}</strong>
        </div>
        <span :class="['tag', journeyInfo.transportTagColor, 'is-dark']">
          {{ journeyInfo.transportLabel }}
        </span>
        <template v-if="journeyInfo.network && journeyInfo.network !== journeyInfo.commercialMode">
          <br />
          <small class="has-text-grey">{{ journeyInfo.network }}</small>
        </template>
      </div>
    </td>
    <td>
      <div>
        <strong class="has-text-info">{{ journeyInfo.departureStation }}</strong>
        <br />
        <span class="is-size-5">{{ formatTime(parseUTCDate(journeyInfo.baseDepartureTime)) }}</span>
        <template v-if="depDelay && depDelay !== 'À l\'heure'">
          <br />
          <span class="has-text-danger">{{ formatTime(parseUTCDate(journeyInfo.realDepartureTime)) }}</span>
        </template>
        <template v-if="depDelay">
          <br />
          <span :class="['tag', 'is-small', depDelay !== 'À l\'heure' ? 'is-danger' : 'is-success']">
            {{ depDelay }}
          </span>
        </template>
      </div>
    </td>
    <td>
      <div>
        <strong class="has-text-info">{{ journeyInfo.arrivalStation }}</strong>
        <br />
        <span class="is-size-5">{{ formatTime(parseUTCDate(journeyInfo.baseArrivalTime)) }}</span>
        <template v-if="arrDelay && arrDelay !== 'À l\'heure'">
          <br />
          <span class="has-text-danger">{{ formatTime(parseUTCDate(journeyInfo.realArrivalTime)) }}</span>
        </template>
        <template v-if="arrDelay">
          <br />
          <span :class="['tag', 'is-small', arrDelay !== 'À l\'heure' ? 'is-danger' : 'is-success']">
            {{ arrDelay }}
          </span>
        </template>
      </div>
    </td>
    <td>
      <span v-if="maxDelay && maxDelay !== 'À l\'heure'" class="tag is-danger">{{ maxDelay }}</span>
      <span v-else class="tag is-success">À l'heure</span>
    </td>
    <td>
      <div v-if="journeyDisruptions.length > 0" class="tags">
        <span
          v-for="(disruption, disIndex) in journeyDisruptions"
          :key="disIndex"
          :class="['tag', getDisruptionTagClass(disruption), 'is-small']"
          :title="getDisruptionMessage(disruption)"
        >
          <span class="icon mr-1">
            <AlertTriangle :size="20" />
          </span>
          {{ truncateMessage(getDisruptionMessage(disruption)) }}
        </span>
      </div>
      <span v-else class="has-text-grey" style="font-style: italic">-</span>
    </td>
    <td>
      <span class="tag is-dark has-text-weight-semibold">{{ Math.floor(journeyInfo.duration / 60) }}min</span>
    </td>
    <td>
      <span v-if="journeyInfo.wagonCount" class="tag is-info is-dark">
        <span class="icon mr-1"><TrainIcon :size="16" /></span>
        {{ journeyInfo.wagonCount }}
      </span>
      <span v-else class="has-text-grey" style="font-style: italic">N/A</span>
    </td>
    <td>
      <RouterLink
        :to="`/trip/${tripId}`"
        class="button is-small is-info is-light"
        @click="$emit('detail-click')"
        title="Voir les détails du trajet"
      >
        <span class="icon">
          <Info :size="16" />
        </span>
      </RouterLink>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, Info, Train as TrainIcon } from 'lucide-vue-next';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import { parseUTCDate, formatTime, formatDate } from '@/utils/dateUtils';
import { getDelay, getMaxDelay } from '@/services/delayService';
import { encodeVehicleJourneyId } from '@/utils/uriUtils';

interface Props {
  journey: JourneyItem;
  journeyInfo: JourneyInfo;
  journeyDisruptions: Disruption[];
  tripId: string;
}

const props = defineProps<Props>();

defineEmits<{
  'detail-click': [];
}>();

const depDate = computed(() => parseUTCDate(props.journeyInfo.departureTime));
const arrDate = computed(() => parseUTCDate(props.journeyInfo.arrivalTime));
const depDelay = computed(() => getDelay(props.journeyInfo.baseDepartureTime, props.journeyInfo.realDepartureTime));
const arrDelay = computed(() => getDelay(props.journeyInfo.baseArrivalTime, props.journeyInfo.realArrivalTime));
const maxDelay = computed(() => getMaxDelay(
  depDelay.value,
  arrDelay.value,
  props.journeyInfo.baseDepartureTime,
  props.journeyInfo.realDepartureTime,
  props.journeyInfo.baseArrivalTime,
  props.journeyInfo.realArrivalTime
));

const getTrainId = (): string | null => {
  if (!props.journeyInfo.vehicleJourneyId) return null;
  let trainId = props.journeyInfo.vehicleJourneyId;
  if (typeof trainId === 'object' && trainId !== null) {
    trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
  }
  return trainId as string | null;
};

const getSeverityText = (disruption: Disruption): string => {
  if (typeof disruption.severity === 'string') {
    return disruption.severity;
  } else if (disruption.severity && typeof disruption.severity === 'object') {
    return (disruption.severity as { name?: string; label?: string }).name ||
           (disruption.severity as { name?: string; label?: string }).label ||
           'Perturbation';
  }
  return 'unknown';
};

const getDisruptionTagClass = (disruption: Disruption): string => {
  const severityLevel = getSeverityText(disruption).toLowerCase();
  if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
    return 'is-danger';
  } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
    return 'is-info';
  } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
    return 'is-warning';
  }
  return 'is-warning';
};

const getDisruptionMessage = (disruption: Disruption): string => {
  const message = disruption.messages && disruption.messages.length > 0
    ? disruption.messages[0].text || (disruption.messages[0] as { message?: string }).message
    : disruption.message || getSeverityText(disruption);
  return message || 'Perturbation';
};

const truncateMessage = (message: string): string => {
  return message.length > 30 ? message.substring(0, 30) + '...' : message;
};
</script>

