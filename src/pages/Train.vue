<template>
  <div>
    <PageHeader
      :title="headerTitle"
      subtitle="Consultez un train précis ou lancez une recherche"
      :show-notification="false"
    />
    
    <TrainSearch v-if="!trainId" />
    
    <TrainLoadingState v-else-if="loading" />
    
    <TrainErrorState
      v-else-if="error || !trainData"
      :error="error"
      :refreshing="refreshing"
      @refresh="handleRefresh"
    />
    
    <section v-else class="section">
      <div class="container">
        <div class="box">
          <TrainHeader
            :train-number="trainNumber"
            :refreshing="refreshing"
            @refresh="handleRefresh"
          />

          <!-- Advertisement -->
          <Ad format="horizontal" size="responsive" class="mb-5" />

          <!-- Train Header Info -->
          <TrainInfoCard
            :train-number="trainNumber"
            :commercial-mode="commercialMode"
            :network="network"
            :direction="direction"
          />

          <!-- Map / Waypoints -->
          <div v-if="waypoints.length > 0" class="box">
            <h3 class="title is-4 mb-4">Parcours</h3>
            <TrainWaypointsMap :waypoints="waypoints" />
            <p class="help mt-3">
              Waypoints basés sur les coordonnées (<code>lat/lon</code>) des arrêts du train.
            </p>
          </div>

          <!-- Advertisement -->
          <Ad format="rectangle" size="responsive" class="mb-5" />

          <!-- Stop Times Table -->
          <TrainStopTimesTable :stop-times="stopTimes" />

          <!-- Additional Information -->
          <TrainAdditionalInfo
            :train-data="trainData"
            :display-info="displayInfo"
            :stop-times="stopTimes"
          />
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/Footer.vue';
import Ad from '@/components/Ad.vue';
import { PageHeader } from '@/components/skytrip';
import TrainWaypointsMap from '@/components/TrainWaypointsMap.vue';
import TrainSearch from '@/components/train/TrainSearch.vue';
import TrainLoadingState from '@/components/train/TrainLoadingState.vue';
import TrainErrorState from '@/components/train/TrainErrorState.vue';
import TrainHeader from '@/components/train/TrainHeader.vue';
import TrainInfoCard from '@/components/train/TrainInfoCard.vue';
import TrainStopTimesTable from '@/components/train/TrainStopTimesTable.vue';
import TrainAdditionalInfo from '@/components/train/TrainAdditionalInfo.vue';
import { getVehicleJourney } from '@/services/vehicleJourneyService';
import { decodeVehicleJourneyId, extractTrainNumber } from '@/utils/uriUtils';
import { cleanLocationName } from '@/services/locationService';
import type { ExtendedVehicleJourney, Waypoint } from '@/components/train/types';

const route = useRoute();
const trainId = computed(() => route.params.id as string | undefined);

const trainData = ref<ExtendedVehicleJourney | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const refreshing = ref<boolean>(false);

const headerTitle = computed(() => trainId.value ? 'Détails du train' : 'Recherche de train');

const displayInfo = computed(() => trainData.value?.display_informations || {});
const stopTimes = computed(() => trainData.value?.stop_times || []);
const commercialMode = computed(() => displayInfo.value.commercial_mode || '');
const network = computed(() => displayInfo.value.network || '');
const trainNumber = computed(() => {
  if (!trainData.value || !trainId.value) return 'N/A';
  return extractTrainNumber(trainData.value, trainId.value);
});
const direction = computed(() => displayInfo.value.direction || '');

const waypoints = computed<Waypoint[]>(() => {
  return (stopTimes.value || [])
    .map((stop, index) => {
      const stopPoint = stop?.stop_point || {};
      const stopArea = (stopPoint as { stop_area?: { name?: string | null; coord?: { lat?: number; lon?: number } } }).stop_area || {};
      const coord = (stopPoint as { coord?: { lat?: number; lon?: number } }).coord || stopArea?.coord;
      const lat = coord?.lat;
      const lon = coord?.lon;

      if (typeof lat !== 'number' || typeof lon !== 'number') return null;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

      return {
        lat,
        lon,
        name: cleanLocationName((stopPoint as { name?: string | null }).name || stopArea?.name || `Arrêt ${index + 1}`),
        isStart: index === 0,
        isEnd: index === stopTimes.value.length - 1,
      };
    })
    .filter((w): w is Waypoint => w !== null)
    .filter((w, idx, arr) => idx === 0 || w.lat !== arr[idx - 1].lat || w.lon !== arr[idx - 1].lon);
});

const fetchTrainDetails = async (isRefresh: boolean = false): Promise<void> => {
  if (!trainId.value) {
    loading.value = false;
    return;
  }

  try {
    if (isRefresh) {
      refreshing.value = true;
    } else {
      loading.value = true;
    }
    error.value = null;
    const decodedId = decodeVehicleJourneyId(trainId.value);
    const response = await getVehicleJourney(decodedId, 'sncf');
    const data = response.data;
    
    if (data.vehicle_journeys && data.vehicle_journeys.length > 0) {
      trainData.value = data.vehicle_journeys[0] as ExtendedVehicleJourney;
    } else {
      error.value = 'Train non trouvé';
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    error.value = 'Erreur lors de la récupération des détails du train: ' + errorMessage;
    console.error(err);
  } finally {
    if (isRefresh) {
      refreshing.value = false;
    } else {
      loading.value = false;
    }
  }
};

const handleRefresh = (): void => {
  fetchTrainDetails(true);
};

watch(trainId, () => {
  if (trainId.value) {
    fetchTrainDetails();
  }
}, { immediate: true });
</script>
