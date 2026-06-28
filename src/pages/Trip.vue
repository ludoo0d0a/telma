<template>
  <div>
    <PageHeader
      title="Détails du trajet"
      subtitle="Horaires, arrêts et perturbations détaillés"
      :show-notification="false"
    />

    <section v-if="loading" class="section">
      <div class="container">
        <div class="box has-text-centered">
          <span class="icon is-large">
            <Loader2 :size="48" class="animate-spin" />
          </span>
          <p class="mt-4">Chargement des détails du trajet...</p>
        </div>
      </div>
    </section>

    <section v-else-if="error || !tripData" class="section">
      <div class="container">
        <div v-if="!tripId" class="box has-text-centered mb-5">
          <span class="icon is-large has-text-info">
            <Route :size="48" />
          </span>
          <p class="mt-4">Sélectionnez un exemple de trajet ci-dessous</p>
        </div>
        <div v-else class="box has-text-centered">
          <span class="icon is-large has-text-danger">
            <AlertTriangle :size="48" />
          </span>
          <p class="mt-4 has-text-danger">{{ error || 'Trajet non trouvé' }}</p>
          <div class="buttons is-centered mt-4">
            <button @click="$router.go(-1)" class="button is-primary">
              Retour
            </button>
            <RouterLink
              v-if="vehicleJourneyId"
              :to="`/train/${encodeVehicleJourneyId(vehicleJourneyId)}`"
              class="button is-link"
            >
              <span class="icon"><TrainIcon :size="20" /></span>
              <span>Voir les détails du train</span>
            </RouterLink>
          </div>
        </div>

        <div v-if="!tripId" class="mt-6">
          <h3 class="title is-4 mb-4">Exemples</h3>
          <div class="columns is-multiline">
            <div
              v-for="sample in sampleTripIds"
              :key="sample.id"
              class="column is-half"
            >
              <RouterLink
                :to="`/trip/${encodeTripId(sample.id)}`"
                class="box is-clickable"
                style="text-decoration: none"
              >
                <div class="is-flex is-align-items-center">
                  <span class="icon is-large has-text-primary mr-3">
                    <Route :size="32" />
                  </span>
                  <div>
                    <p class="title is-5 mb-1">
                      {{ sample.label }}
                    </p>
                    <p class="subtitle is-6 has-text-grey">
                      Cliquez pour voir les détails
                    </p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="section">
      <div class="container">
        <div class="level mb-5">
          <div class="level-left"></div>
          <div class="level-right">
            <div class="level-item">
              <button
                class="button is-light"
                @click="loadTripData(true)"
                :disabled="loading"
              >
                <span class="icon">
                  <Loader2 v-if="loading" :size="20" class="animate-spin" />
                  <RefreshCw v-else :size="20" />
                </span>
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Train Information -->
        <div class="box mb-5">
          <h2 class="title is-4 mb-4">Informations du train</h2>
          <div class="columns">
            <div class="column">
              <div class="is-flex is-align-items-center mb-3">
                <span :class="['icon', transportInfo.color, 'mr-3']" style="font-size: 2rem">
                  <component :is="transportInfo.icon" :size="32" />
                </span>
                <div>
                  <h3 class="title is-5 mb-1">
                    {{ tripData.info.trainNumber }}
                  </h3>
                  <span :class="['tag', transportInfo.tagColor, 'is-medium']">
                    {{ transportInfo.label }}
                  </span>
                  <span v-if="tripData.info.network && tripData.info.network !== tripData.info.commercialMode" class="tag is-dark ml-2">
                    {{ tripData.info.network }}
                  </span>
                </div>
              </div>
              <RouterLink
                v-if="getTrainId()"
                :to="`/train/${encodeVehicleJourneyId(getTrainId()!)}`"
                class="button is-small is-link"
              >
                <span class="icon"><TrainIcon :size="20" /></span>
                <span>Voir les détails du train</span>
              </RouterLink>
            </div>
            <div class="column">
              <div class="content">
                <p><strong>Gare de départ:</strong> {{ tripData.info.departureStation }}</p>
                <p><strong>Gare d'arrivée:</strong> {{ tripData.info.arrivalStation }}</p>
                <p><strong>Date:</strong> {{ depDate ? formatDate(depDate) : '-' }}</p>
                <p><strong>Durée totale:</strong> {{ formatDuration(tripData.info.duration) }}</p>
                <p v-if="tripData.info.wagonCount">
                  <strong>Nombre de wagons:</strong> {{ tripData.info.wagonCount }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Journey Map -->
        <div v-if="sectionsWithGeoJSON.length > 0 || journeyMarkers.length > 0" class="box mb-5">
          <h2 class="title is-4 mb-4">
            <span class="icon mr-2">
              <Map :size="20" />
            </span>
            Carte de l'itinéraire
          </h2>
          <GeoJSONMap
            :geojson-data="sectionsWithGeoJSON.length > 0 ? sectionsWithGeoJSON : undefined"
            :markers="journeyMarkers"
            :height="400"
          />
        </div>

        <!-- Disruptions -->
        <div v-if="tripData.disruptions && tripData.disruptions.length > 0" class="box mb-5">
          <h2 class="title is-4 mb-4">
            <span class="icon has-text-warning mr-2">
              <AlertTriangle :size="20" />
            </span>
            Perturbations ({{ tripData.disruptions.length }})
          </h2>
          <div
            v-for="(disruption, index) in tripData.disruptions"
            :key="index"
            :class="['notification', getDisruptionClass(disruption), 'mb-3']"
          >
            <div class="is-flex is-align-items-center mb-2">
              <span class="icon mr-2">
                <component :is="getDisruptionIcon(disruption)" :size="20" />
              </span>
              <strong>{{ getSeverityText(disruption) !== 'unknown' ? getSeverityText(disruption) : 'Perturbation' }}</strong>
            </div>
            <div v-if="disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0" class="content mb-2">
              <p v-for="(msg, msgIndex) in disruption.messages" :key="msgIndex" class="mb-2">
                {{ msg.text || (msg as { message?: string }).message || JSON.stringify(msg) }}
              </p>
            </div>
            <p v-else-if="disruption.message" class="mb-2">{{ disruption.message }}</p>
            <div v-if="disruption.application_periods && disruption.application_periods.length > 0" class="content is-small mt-2">
              <p class="has-text-weight-semibold">Période d'application:</p>
              <ul>
                <li v-for="(period, periodIndex) in disruption.application_periods" :key="periodIndex">
                  Du {{ period.begin ? new Date(period.begin).toLocaleString('fr-FR') : '-' }}
                  au {{ period.end ? new Date(period.end).toLocaleString('fr-FR') : '-' }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- All Stops -->
        <div class="box">
          <h2 class="title is-4 mb-4">Arrêts et horaires</h2>
          <p v-if="allStops.length === 0" class="has-text-grey">Aucun arrêt disponible pour ce trajet.</p>
          <div v-else class="table-container">
            <table class="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>Gare</th>
                  <th>Voie/Quai</th>
                  <th>Horaire</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stop, index) in allStops" :key="index">
                  <td>
                    <strong>{{ getStopName(stop) }}</strong>
                    <span v-if="stop.isFirst" class="tag is-success is-small ml-2">Départ</span>
                    <span v-if="stop.isLast" class="tag is-danger is-small ml-2">Arrivée</span>
                  </td>
                  <td>{{ stop.stop_point?.label || '-' }}</td>
                  <td>
                    <div v-if="getParsedBaseTime(stop)">
                      <div class="is-flex is-align-items-center">
                        <span class="is-size-5 has-text-weight-semibold">
                          {{ formatTime(getParsedBaseTime(stop)!) }}
                        </span>
                        <template v-if="hasDelay(stop) && getParsedRealTime(stop)">
                          <span class="mx-2 has-text-grey">→</span>
                          <span class="is-size-5 has-text-danger has-text-weight-semibold">
                            {{ formatTime(getParsedRealTime(stop)!) }}
                          </span>
                        </template>
                      </div>
                      <div v-if="getDelay(stop)" class="mt-1">
                        <span v-if="hasDelay(stop)" class="tag is-danger is-small">
                          <span class="icon mr-1">
                            <Clock :size="16" />
                          </span>
                          {{ getDelay(stop) }}
                        </span>
                        <span v-else class="tag is-success is-small">
                          {{ getDelay(stop) }}
                        </span>
                      </div>
                    </div>
                    <span v-else class="has-text-grey">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, RefreshCw, Route, AlertTriangle, Train as TrainIcon, Map, Ban, Info, Clock } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import GeoJSONMap from '@/components/GeoJSONMap.vue';
import { parseUTCDate, formatTime, formatDate } from '@/utils/dateUtils';
import { cleanLocationName } from '@/services/locationService';
import { getTransportIcon } from '@/services/transportService';
import { getDelay } from '@/services/delayService';
import { getVehicleJourney } from '@/services/vehicleJourneyService';
import { getJourneyInfo } from '@/services/journeyService';
import { decodeTripId, decodeVehicleJourneyId, encodeVehicleJourneyId, encodeTripId } from '@/utils/uriUtils';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import type { Section } from '@/client/models/section';
import type { VehicleJourney } from '@/client/models/vehicle-journey';

interface TripData {
  journey: JourneyItem;
  info: JourneyInfo;
  disruptions: Disruption[];
}

interface JourneyMarker {
  lat: number;
  lon: number;
  name: string | null | undefined;
  popup: string;
}

interface ExtendedStopTime {
  base_arrival_date_time?: string;
  arrival_date_time?: string;
  base_departure_date_time?: string;
  departure_date_time?: string;
  stop_point?: {
    name?: string | null;
    label?: string | null;
    coord?: { lat?: number; lon?: number };
    stop_area?: {
      name?: string | null;
      coord?: { lat?: number; lon?: number };
    };
  };
  stop_area?: {
    name?: string | null;
  };
  section?: Section;
  isFirst: boolean;
  isLast: boolean;
  commercialMode?: string;
  network?: string;
  trainNumber?: string;
}

const route = useRoute();
const router = useRouter();

const tripId = computed(() => route.params.tripId as string | undefined);
const tripData = ref<TripData | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const vehicleJourneyId = ref<string | null>(null);
const loadingRef = ref<boolean>(false);

const sampleTripIds = [
  {
    id: 'vehicle_journey:SNCF:2025-12-20:88507:1187:Train_20251220T113300',
    label: 'Train 88507 - 20/12/2025 11:33'
  }
];

const loadTripData = async (forceRefresh: boolean = false): Promise<void> => {
  if (loadingRef.value && !forceRefresh) {
    return;
  }

  try {
    loadingRef.value = true;
    loading.value = true;
    error.value = null;

    if (!tripId.value) {
      console.error('[Trip] Missing tripId');
      error.value = 'ID de trajet manquant';
      loading.value = false;
      return;
    }

    let cachedDataBackup: TripData | null = null;
    if (forceRefresh) {
      const cacheKey = `trip_${tripId.value}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          cachedDataBackup = JSON.parse(cachedData) as TripData;
        } catch (e) {
          // Backup parse failed
        }
      }
      sessionStorage.removeItem(cacheKey);
      tripData.value = null;
      error.value = null;
    }

    if (!forceRefresh) {
      const storedData = sessionStorage.getItem(`trip_${tripId.value}`);
      if (storedData) {
        const data = JSON.parse(storedData) as TripData;
        tripData.value = data;
        loading.value = false;
        return;
      }
    }

    let extractedVehicleJourneyId: string | null = null;
    try {
      const decoded = decodeTripId(tripId.value);

      if (decoded.includes('vehicle_journey:')) {
        const vehicleJourneyPrefix = 'vehicle_journey:';
        const lastUnderscoreIndex = decoded.lastIndexOf('_');
        const prefixIndex = decoded.indexOf(vehicleJourneyPrefix);

        if (lastUnderscoreIndex > prefixIndex + vehicleJourneyPrefix.length) {
          extractedVehicleJourneyId = decoded.substring(0, lastUnderscoreIndex);
        } else {
          extractedVehicleJourneyId = decoded;
        }
      } else if (decoded.includes('_')) {
        const lastUnderscoreIndex = decoded.lastIndexOf('_');
        if (lastUnderscoreIndex > 0) {
          extractedVehicleJourneyId = decoded.substring(0, lastUnderscoreIndex);
        } else {
          extractedVehicleJourneyId = decoded;
        }
      } else {
        extractedVehicleJourneyId = decoded;
      }

      if (!extractedVehicleJourneyId && tripId.value.includes('vehicle_journey:')) {
        extractedVehicleJourneyId = tripId.value;
      }

      if (extractedVehicleJourneyId) {
        vehicleJourneyId.value = extractedVehicleJourneyId;
      }

      if (extractedVehicleJourneyId) {
        let cleanVehicleJourneyId = extractedVehicleJourneyId;
        try {
          if (cleanVehicleJourneyId.includes('%')) {
            cleanVehicleJourneyId = decodeURIComponent(cleanVehicleJourneyId);
          }
        } catch (e) {
          // If decoding fails, use as-is
        }

        let vehicleJourneyData;
        try {
          const data = await getVehicleJourney(cleanVehicleJourneyId, 'sncf');
          vehicleJourneyData = data.data;
        } catch (apiError: any) {
          console.error('[Trip] API error:', apiError);

          if (apiError?.response?.status === 404) {
            let dataToRestore: TripData | null = null;

            if (forceRefresh && cachedDataBackup) {
              dataToRestore = cachedDataBackup;
            } else if (!forceRefresh) {
              const cachedData = sessionStorage.getItem(`trip_${tripId.value}`);
              if (cachedData) {
                try {
                  dataToRestore = JSON.parse(cachedData) as TripData;
                } catch (e) {
                  // Cache parse failed
                }
              }
            }

            if (dataToRestore) {
              sessionStorage.setItem(`trip_${tripId.value}`, JSON.stringify(dataToRestore));
              tripData.value = dataToRestore;
              loading.value = false;
              return;
            }
          }

          throw apiError;
        }

        if (vehicleJourneyData.vehicle_journeys && vehicleJourneyData.vehicle_journeys.length > 0) {
          const vehicleJourney = vehicleJourneyData.vehicle_journeys[0] as VehicleJourney & {
            display_informations?: any;
            stop_times?: Array<any>;
          };

          const stopTimes = vehicleJourney.stop_times || [];

          if (stopTimes.length > 0) {
            const firstStop = stopTimes[0];
            const lastStop = stopTimes[stopTimes.length - 1];

            const firstDeparture = firstStop.departure_date_time || firstStop.base_departure_date_time || firstStop.utc_departure_time || '';
            const lastArrival = lastStop.arrival_date_time || lastStop.base_arrival_date_time || lastStop.utc_arrival_time || '';

            let geojson = (vehicleJourney as any).geojson;

            if (!geojson) {
              const stopCoordinates: [number, number][] = [];
              stopTimes.forEach((st: any) => {
                const stopPoint = st.stop_point;
                const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;
                if (coord && typeof coord.lat === 'number' && typeof coord.lon === 'number' &&
                    Number.isFinite(coord.lat) && Number.isFinite(coord.lon)) {
                  stopCoordinates.push([coord.lon, coord.lat]);
                }
              });

              const uniqueCoords = stopCoordinates.filter((coord, idx, arr) =>
                idx === 0 || coord[0] !== arr[idx - 1][0] || coord[1] !== arr[idx - 1][1]
              );

              geojson = uniqueCoords.length >= 2 ? {
                type: 'Feature' as const,
                geometry: {
                  type: 'LineString' as const,
                  coordinates: uniqueCoords
                },
                properties: {}
              } : undefined;
            }

            const section: Section = {
              type: 'public_transport',
              from: {
                stop_point: firstStop.stop_point,
                stop_area: firstStop.stop_point?.stop_area,
                coord: firstStop.stop_point?.coord
              },
              to: {
                stop_point: lastStop.stop_point,
                stop_area: lastStop.stop_point?.stop_area,
                coord: lastStop.stop_point?.coord
              },
              display_informations: {
                commercial_mode: (vehicleJourney.journey_pattern as any)?.route?.line?.commercial_mode?.name ||
                                 (vehicleJourney.journey_pattern as any)?.commercial_mode || 'Train',
                network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                headsign: vehicleJourney.headsign || '',
                trip_short_name: vehicleJourney.name || ''
              },
              vehicle_journey: vehicleJourney.id || extractedVehicleJourneyId,
              geojson: geojson,
              stop_date_times: stopTimes.map((st: any) => {
                const baseArrival = (st.base_arrival_date_time && st.base_arrival_date_time.trim()) || (st.utc_arrival_time && st.utc_arrival_time.trim()) || undefined;
                const arrival = (st.arrival_date_time && st.arrival_date_time.trim()) || (st.utc_arrival_time && st.utc_arrival_time.trim()) || undefined;
                const baseDeparture = (st.base_departure_date_time && st.base_departure_date_time.trim()) || (st.utc_departure_time && st.utc_departure_time.trim()) || undefined;
                const departure = (st.departure_date_time && st.departure_date_time.trim()) || (st.utc_departure_time && st.utc_departure_time.trim()) || undefined;

                return {
                  base_arrival_date_time: baseArrival,
                  arrival_date_time: arrival,
                  base_departure_date_time: baseDeparture,
                  departure_date_time: departure,
                  stop_point: st.stop_point,
                  stop_area: st.stop_point?.stop_area
                };
              }),
              base_departure_date_time: firstStop.base_departure_date_time || firstStop.utc_departure_time,
              departure_date_time: firstStop.departure_date_time || firstStop.utc_departure_time,
              base_arrival_date_time: lastStop.base_arrival_date_time || lastStop.utc_arrival_time,
              arrival_date_time: lastStop.arrival_date_time || lastStop.utc_arrival_time
            };

            let durationSeconds = 0;
            if (stopTimes.length > 0 && firstDeparture && lastArrival && firstDeparture.trim() && lastArrival.trim()) {
              try {
                const depDate = parseUTCDate(firstDeparture);
                const arrDate = parseUTCDate(lastArrival);
                if (!isNaN(depDate.getTime()) && !isNaN(arrDate.getTime())) {
                  durationSeconds = Math.floor((arrDate.getTime() - depDate.getTime()) / 1000);
                }
              } catch (e) {
                durationSeconds = 0;
              }
            }

            const journey: JourneyItem = {
              departure_date_time: firstDeparture,
              arrival_date_time: lastArrival,
              sections: [section],
              durations: {
                total: durationSeconds
              }
            };

            const info = getJourneyInfo(journey,
              cleanLocationName(firstStop.stop_point?.name || firstStop.stop_point?.stop_area?.name),
              cleanLocationName(lastStop.stop_point?.name || lastStop.stop_point?.stop_area?.name)
            );

            const data: TripData = {
              journey,
              info,
              disruptions: vehicleJourney.disruptions || []
            };

            sessionStorage.setItem(`trip_${tripId.value}`, JSON.stringify(data));
            tripData.value = data;
            loading.value = false;
            return;
          }
        }
      }
    } catch (apiErr) {
      // Error handling
    }

    error.value = 'Données du trajet non trouvées. Veuillez revenir à la recherche.';
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    error.value = 'Erreur lors du chargement des données du trajet: ' + errorMessage;
  } finally {
    loadingRef.value = false;
    loading.value = false;
  }
};

watch(tripId, () => {
  if (tripId.value) {
    loadTripData();
  }
}, { immediate: true });

const sections = computed(() => tripData.value?.journey?.sections || []);
const publicTransportSections = computed(() => sections.value.filter((s: Section) => s.type === 'public_transport'));

const allStops = computed<ExtendedStopTime[]>(() => {
  const stops: ExtendedStopTime[] = [];
  publicTransportSections.value.forEach((section: Section) => {
    if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
      section.stop_date_times.forEach((stopTime, index) => {
        const isFirst = index === 0;
        const isLast = index === section.stop_date_times!.length - 1;
        stops.push({
          ...(stopTime as ExtendedStopTime),
          section,
          isFirst,
          isLast,
          commercialMode: section.display_informations?.commercial_mode,
          network: section.display_informations?.network,
          trainNumber: section.display_informations?.headsign || section.display_informations?.trip_short_name
        });
      });
    }
  });
  return stops;
});

const sectionsWithGeoJSON = computed<Section[]>(() => {
  return sections.value.filter((section: Section) => section.geojson);
});

const journeyMarkers = computed<JourneyMarker[]>(() => {
  if (!allStops.value || allStops.value.length === 0) {
    return [];
  }

  const markers: JourneyMarker[] = [];
  allStops.value.forEach((stop, index) => {
    const stopPoint = stop.stop_point as { coord?: { lat?: number; lon?: number }; name?: string | null; stop_area?: { coord?: { lat?: number; lon?: number }; name?: string | null } } | undefined;
    const stopArea = stopPoint?.stop_area as { coord?: { lat?: number; lon?: number }; name?: string | null } | undefined;
    const coord = stopPoint?.coord || stopArea?.coord;

    if (coord && typeof coord.lat === 'number' && typeof coord.lon === 'number' &&
        Number.isFinite(coord.lat) && Number.isFinite(coord.lon)) {
      const stopName = cleanLocationName(
        stopPoint?.name || stopArea?.name || `Arrêt ${index + 1}`
      );
      const isFirst = stop.isFirst;
      const isLast = stop.isLast;

      let popupText = `<strong>${stopName}</strong>`;
      if (isFirst) popupText += '<div>Départ</div>';
      if (isLast) popupText += '<div>Arrivée</div>';
      if (!isFirst && !isLast) popupText += '<div>Arrêt intermédiaire</div>';

      markers.push({
        lat: coord.lat,
        lon: coord.lon,
        name: stopName,
        popup: popupText
      });
    }
  });
  return markers;
});

const transportInfo = computed(() => {
  if (!tripData.value) return getTransportIcon('', '');
  return getTransportIcon(tripData.value.info.commercialMode, tripData.value.info.network);
});

const depDate = computed<Date | null>(() => {
  if (!tripData.value?.info.departureTime || !tripData.value.info.departureTime.trim()) return null;
  try {
    const date = parseUTCDate(tripData.value.info.departureTime);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
});

const formatDuration = (durationSeconds: number): string => {
  if (!durationSeconds || durationSeconds <= 0) return '-';
  const days = Math.floor(durationSeconds / 86400);
  const hours = Math.floor((durationSeconds % 86400) / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);

  return parts.length > 0 ? parts.join(' ') : '< 1min';
};

const getTrainId = (): string | null => {
  if (!tripData.value?.info.vehicleJourneyId) return null;
  let trainId = tripData.value.info.vehicleJourneyId;
  if (typeof trainId === 'object' && trainId !== null) {
    trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
  }
  return trainId as string | null;
};

const getStopName = (stop: ExtendedStopTime): string => {
  return cleanLocationName(
    stop.stop_point?.name ||
    stop.stop_area?.name ||
    'Gare inconnue'
  );
};

const getParsedBaseTime = (stop: ExtendedStopTime): Date | null => {
  const baseTime = stop.isLast ? (stop.base_departure_date_time || undefined) : (stop.base_arrival_date_time || undefined);
  if (!baseTime || !baseTime.trim()) return null;
  try {
    const date = parseUTCDate(baseTime);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

const getParsedRealTime = (stop: ExtendedStopTime): Date | null => {
  const realTime = stop.isLast ? (stop.departure_date_time || undefined) : (stop.arrival_date_time || undefined);
  if (!realTime || !realTime.trim()) return null;
  try {
    const date = parseUTCDate(realTime);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

const getDelay = (stop: ExtendedStopTime): string | null => {
  const baseTime = stop.isLast ? (stop.base_departure_date_time || undefined) : (stop.base_arrival_date_time || undefined);
  const realTime = stop.isLast ? (stop.departure_date_time || undefined) : (stop.arrival_date_time || undefined);
  return getDelay(baseTime, realTime);
};

const hasDelay = (stop: ExtendedStopTime): boolean => {
  const delay = getDelay(stop);
  return delay !== null && delay !== 'À l\'heure';
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

const getDisruptionClass = (disruption: Disruption): string => {
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

const getDisruptionIcon = (disruption: Disruption) => {
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
