<template>
  <div v-if="disruptions.length > 0" class="box mb-5">
    <h3
      class="title is-5 mb-4 is-clickable"
      @click="showDisruptionsSection = !showDisruptionsSection"
      style="cursor: pointer"
    >
      <span class="icon has-text-warning mr-2">
        <AlertTriangle :size="20" />
      </span>
      Perturbations ({{ disruptions.length }})
      <span class="icon ml-2">
        <ChevronUp v-if="showDisruptionsSection" :size="20" />
        <ChevronDown v-else :size="20" />
      </span>
    </h3>
    <template v-if="showDisruptionsSection">
      <div
        v-for="(disruption, index) in disruptions"
        :key="index"
        :class="['notification', getNotificationClass(disruption), 'mb-3']"
      >
        <div class="is-flex is-align-items-center mb-2">
          <span class="icon mr-2">
            <component :is="getIconComponent(disruption)" :size="20" />
          </span>
          <strong>
            {{ getSeverityText(disruption) !== 'unknown' ? getSeverityText(disruption) : 'Perturbation' }}
          </strong>
        </div>
        <div v-if="disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0" class="content mb-2">
          <p v-for="(msg, msgIndex) in disruption.messages" :key="msgIndex" class="mb-2">
            {{ msg.text || (msg as { message?: string }).message || JSON.stringify(msg) }}
          </p>
        </div>
        <p v-else-if="disruption.message" class="mb-2">{{ disruption.message }}</p>
        <div v-if="disruption.impacted_objects && disruption.impacted_objects.length > 0" class="content is-small mt-2">
          <p class="has-text-weight-semibold">Objets impactés:</p>
          <div v-for="(obj, objIndex) in disruption.impacted_objects" :key="objIndex" class="mb-3">
            <p class="has-text-weight-medium mb-1">
              {{ obj.pt_object?.name || obj.pt_object?.id || `Objet ${objIndex + 1}` }}
            </p>
            <div v-if="obj.impacted_stops && Array.isArray(obj.impacted_stops) && obj.impacted_stops.length > 0" class="ml-3">
              <p class="has-text-weight-semibold is-size-7 mb-1">Arrêts impactés:</p>
              <ul class="is-size-7">
                <li v-for="(stop, stopIndex) in obj.impacted_stops" :key="stopIndex">
                  {{ cleanLocationName(stop.name || stop.stop_point?.name || stop.stop_area?.name || stop.id || 'Arrêt inconnu') }}
                </li>
              </ul>
            </div>
            <div v-if="obj.pt_object" class="ml-3 is-size-7">
              <p v-if="obj.pt_object.name"><strong>Nom:</strong> {{ obj.pt_object.name }}</p>
              <p v-if="obj.pt_object.id"><strong>ID:</strong> {{ obj.pt_object.id }}</p>
              <p v-if="obj.pt_object.embedded_type"><strong>Type:</strong> {{ obj.pt_object.embedded_type }}</p>
            </div>
          </div>
        </div>
        <div v-if="disruption.application_periods && disruption.application_periods.length > 0" class="content is-small mt-2">
          <p class="has-text-weight-semibold">Période d'application:</p>
          <ul>
            <li v-for="(period, periodIndex) in disruption.application_periods" :key="periodIndex">
              Du {{ period.begin ? new Date(period.begin).toLocaleString('fr-FR') : 'N/A' }}
              au {{ period.end ? new Date(period.end).toLocaleString('fr-FR') : 'N/A' }}
            </li>
          </ul>
        </div>
      </div>
    </template>
    <p v-if="!showDisruptionsSection" class="has-text-grey is-italic">
      Cliquez sur le titre pour afficher les détails des perturbations.
      Les perturbations sont également affichées dans le tableau ci-dessous.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AlertTriangle, ChevronUp, ChevronDown, Ban, Info, Clock } from 'lucide-vue-next';
import type { Disruption } from '@/client/models/disruption';
import { cleanLocationName } from '@/services/locationService';

interface Props {
  disruptions: Disruption[];
}

defineProps<Props>();

const showDisruptionsSection = ref<boolean>(false);

const getSeverityText = (disruption: Disruption): string => {
  if (typeof disruption.severity === 'string') {
    return disruption.severity;
  } else if (disruption.severity && typeof disruption.severity === 'object') {
    return (disruption.severity as { name?: string; label?: string }).name ||
           (disruption.severity as { name?: string; label?: string }).label ||
           JSON.stringify(disruption.severity);
  }
  return 'unknown';
};

const getNotificationClass = (disruption: Disruption): string => {
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

const getIconComponent = (disruption: Disruption) => {
  const severityLevel = getSeverityText(disruption).toLowerCase();
  if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
    return Ban;
  } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
    return Info;
  } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
    return Clock;
  }
  return AlertTriangle;
};
</script>

