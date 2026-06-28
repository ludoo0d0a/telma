<template>
  <div>
    <PageHeader
      title="Détection de localisation"
      subtitle="Identifiez votre position, la gare la plus proche et le train en cours"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="box mb-5">
          <h3 class="title is-5 mb-4">Détecter votre position</h3>
          <p class="mb-4">
            Cette page détecte votre position exacte et tente de déterminer :
          </p>
          <ul class="mb-4">
            <li>Si vous êtes dans une gare</li>
            <li>Sur quel quai vous vous trouvez</li>
            <li>Dans quel train vous êtes actuellement</li>
          </ul>

          <div class="buttons">
            <button
              class="button is-primary"
              @click="handleDetectLocation"
              :disabled="loading || watchingLocation"
            >
              <span class="icon"><MapPin :size="20" /></span>
              <span>Détecter maintenant</span>
            </button>
            <button
              v-if="!watchingLocation"
              class="button is-info"
              @click="handleStartWatching"
              :disabled="loading"
            >
              <span class="icon"><RefreshCw :size="20" /></span>
              <span>Surveiller en continu</span>
            </button>
            <button
              v-else
              class="button is-danger"
              @click="handleStopWatching"
            >
              <span class="icon"><Square :size="20" /></span>
              <span>Arrêter la surveillance</span>
            </button>
          </div>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          {{ error }}
        </div>

        <div v-if="loading && !detectionResult" class="box has-text-centered">
          <span class="icon is-large">
            <Loader2 :size="48" class="animate-spin" />
          </span>
          <p class="mt-4">Détection en cours...</p>
        </div>

        <div v-if="detectionResult" class="box">
          <h3 class="title is-4 mb-4">Résultats de la détection</h3>

          <div v-if="detectionResult.userLocation" class="mb-4">
            <p><strong>Votre position :</strong></p>
            <p>
              Latitude: {{ detectionResult.userLocation.lat.toFixed(6) }},
              Longitude: {{ detectionResult.userLocation.lon.toFixed(6) }}
            </p>
            <p>Précision: ±{{ Math.round(detectionResult.userLocation.accuracy) }}m</p>
          </div>

          <template v-if="detectionResult.isInStation">
            <div v-if="detectionResult.station" class="mb-4">
              <p class="has-text-success">
                <span class="icon"><CheckCircle2 :size="20" /></span>
                <strong>Vous êtes dans une gare !</strong>
              </p>
              <p><strong>Gare :</strong> {{ detectionResult.station.name }}</p>
              <p>Distance: {{ detectionResult.station.distance }}m</p>
            </div>

            <div v-if="detectionResult.platform" class="mb-4">
              <p><strong>Quai détecté :</strong></p>
              <p>{{ detectionResult.platform.name }}</p>
            </div>

            <div v-if="detectionResult.detectedTrain" class="mb-4">
              <p class="has-text-info">
                <span class="icon"><Train :size="20" /></span>
                <strong>Train détecté !</strong>
              </p>
              <div class="box" style="background-color: #f5f5f5">
                <p><strong>Numéro de train :</strong> {{ detectionResult.detectedTrain.trainNumber }}</p>
                <p><strong>Destination :</strong> {{ detectionResult.detectedTrain.destination }}</p>
                <p><strong>Réseau :</strong> {{ detectionResult.detectedTrain.network }}</p>
                <p><strong>Arrêt actuel :</strong> {{ detectionResult.detectedTrain.currentStop }}</p>
                <p><strong>Prochain arrêt :</strong> {{ detectionResult.detectedTrain.nextStop }}</p>
                <p><strong>Confiance :</strong> {{ detectionResult.detectedTrain.confidence }}%</p>
                <div class="buttons mt-4">
                  <RouterLink
                    :to="`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`"
                    class="button is-primary"
                  >
                    <span class="icon"><Info :size="20" /></span>
                    <span>Voir les détails du train</span>
                  </RouterLink>
                </div>
              </div>
            </div>
            <div v-else class="mb-4">
              <p class="has-text-warning">
                <span class="icon"><AlertTriangle :size="20" /></span>
                Aucun train détecté à votre position actuelle.
              </p>
              <p class="is-size-7 mt-2">
                Cela peut signifier que vous êtes sur un quai sans train,
                ou que le train n'a pas encore été détecté. Essayez de vous déplacer
                ou attendez quelques instants.
              </p>
            </div>
          </template>
          <template v-else>
            <div class="mb-4">
              <p class="has-text-warning">
                <span class="icon"><AlertTriangle :size="16" /></span>
                Vous ne semblez pas être dans une gare.
              </p>
              <p class="is-size-7 mt-2">
                Aucune gare trouvée à moins de 200m de votre position.
                Vous pouvez sélectionner une gare dans la liste ci-dessous pour continuer.
              </p>
            </div>

            <div v-if="detectionResult.nearbyStations && detectionResult.nearbyStations.length > 0" class="mb-4">
              <h4 class="title is-5 mb-3">Gares à proximité</h4>
              <p class="is-size-7 mb-3 has-text-grey">
                Sélectionnez une gare pour la définir comme gare actuelle et détecter les trains :
              </p>
              <div class="columns is-multiline">
                <div
                  v-for="(station, idx) in sortedNearbyStations"
                  :key="`station-${station.id}-${idx}`"
                  class="column is-half-tablet is-one-third-desktop"
                >
                  <div
                    :class="['box', 'station-card', { 'has-background-info-light': selectedStation?.id === station.id }]"
                    :style="{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: selectedStation?.id === station.id ? '2px solid #3273dc' : '1px solid #dbdbdb'
                    }"
                    @click="handleSelectStation({
                      id: station.id,
                      name: station.name,
                      distance: station.distance,
                      coord: station.coord
                    })"
                    @mouseenter="handleStationHover($event, station.id)"
                    @mouseleave="handleStationLeave($event, station.id)"
                  >
                    <div class="level mb-2">
                      <div class="level-left">
                        <div class="level-item">
                          <span class="icon has-text-primary">
                            <Train :size="16" />
                          </span>
                        </div>
                        <div class="level-item">
                          <strong>{{ station.name }}</strong>
                        </div>
                      </div>
                    </div>
                    <p class="is-size-7 has-text-grey">
                      <span class="icon is-small"><MapPin :size="16" /></span>
                      Distance: {{ station.distance }}m
                    </p>
                    <p v-if="selectedStation?.id === station.id" class="has-text-info is-size-7 mt-2">
                      <span class="icon"><CheckCircle2 :size="20" /></span>
                      Gare sélectionnée
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="detectingTrainForStation" class="box has-text-centered">
                <span class="icon is-large">
                  <Loader2 :size="32" class="animate-spin" />
                </span>
                <p class="mt-3">Détection des trains en cours...</p>
              </div>
            </div>

            <template v-if="selectedStation && detectionResult.isInStation">
              <div v-if="detectionResult.detectedTrain" class="mb-4">
                <p class="has-text-info">
                  <span class="icon"><Train :size="20" /></span>
                  <strong>Train détecté !</strong>
                </p>
                <div class="box" style="background-color: #f5f5f5">
                  <p><strong>Numéro de train :</strong> {{ detectionResult.detectedTrain.trainNumber }}</p>
                  <p><strong>Destination :</strong> {{ detectionResult.detectedTrain.destination }}</p>
                  <p><strong>Réseau :</strong> {{ detectionResult.detectedTrain.network }}</p>
                  <p><strong>Arrêt actuel :</strong> {{ detectionResult.detectedTrain.currentStop }}</p>
                  <p><strong>Prochain arrêt :</strong> {{ detectionResult.detectedTrain.nextStop }}</p>
                  <p><strong>Confiance :</strong> {{ detectionResult.detectedTrain.confidence }}%</p>
                  <div class="buttons mt-4">
                    <RouterLink
                      :to="`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`"
                      class="button is-primary"
                    >
                      <span class="icon"><Info :size="20" /></span>
                      <span>Voir les détails du train</span>
                    </RouterLink>
                  </div>
                </div>
              </div>
              <div v-else class="mb-4">
                <p class="has-text-warning">
                  <span class="icon"><AlertTriangle :size="20" /></span>
                  Aucun train détecté à la gare sélectionnée.
                </p>
                <p class="is-size-7 mt-2">
                  Cela peut signifier qu'il n'y a pas de train actuellement à cette gare,
                  ou que le train n'a pas encore été détecté.
                </p>
              </div>
            </template>
          </template>
        </div>

        <!-- Map showing user location and nearby stations -->
        <div v-if="detectionResult && detectionResult.userLocation" class="box mt-5">
          <h3 class="title is-5 mb-4">Carte des gares à proximité</h3>
          <div ref="mapContainer" style="height: 500px; width: 100%; border-radius: 6px; overflow: hidden"></div>
          <div class="mt-3">
            <p class="is-size-7 has-text-grey">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #00d1b2; border: 2px solid white; margin-right: 6px; vertical-align: middle"></span>
              Votre position
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #ff3860; border: 2px solid white; margin-right: 6px; margin-left: 12px; vertical-align: middle"></span>
              Gare détectée
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #3273dc; border: 2px solid white; margin-right: 6px; margin-left: 12px; vertical-align: middle"></span>
              Autres gares
            </p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { MapPin, RefreshCw, Square, Loader2, CheckCircle2, Train, Info, AlertTriangle } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '@/services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '@/services/vehicleJourneyService';
import { encodeVehicleJourneyId } from '@/utils/uriUtils';
import { cleanLocationName } from '@/services/locationService';
import { parseUTCDate } from '@/utils/dateUtils';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Departure } from '@/client/models/departure';
import type { Arrival } from '@/client/models/arrival';
import type { VehicleJourney } from '@/client/models/vehicle-journey';
import type { StopTime } from '@/client/models/stop-time';

export const DEFAULT_RADIUS_NEARBY = 5000;
export const DEFAULT_RADIUS_NEARBY_LARGE = 10000;

interface DetectedTrain {
  vehicleJourneyId: string;
  trainNumber: string;
  destination: string;
  network: string;
  currentStop: string;
  nextStop: string;
  confidence: number;
  stopPoint?: {
    id?: string;
    name?: string;
    coord?: { lat?: number; lon?: number };
  };
}

interface DetectionResult {
  isInStation: boolean;
  station?: {
    id: string;
    name: string;
    distance: number;
    coord: { lat: number; lon: number };
  };
  platform?: {
    id: string;
    name: string;
    coord: { lat: number; lon: number };
  };
  detectedTrain?: DetectedTrain;
  userLocation?: { lat: number; lon: number; accuracy: number };
  nearbyStations?: Array<{
    id: string;
    name: string;
    distance: number;
    coord: { lat: number; lon: number };
    type: 'stop_area' | 'stop_point';
  }>;
}

interface SelectedStation {
  id: string;
  name: string;
  distance: number;
  coord: { lat: number; lon: number };
}

const detectionResult = ref<DetectionResult | null>(null);
const isMapLoaded = ref<boolean>(false);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const watchingLocation = ref<boolean>(false);
const selectedStationIndex = ref<number | null>(null);
const selectedStation = ref<SelectedStation | null>(null);
const detectingTrainForStation = ref<boolean>(false);
const watchIdRef = ref<number | null>(null);
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<maplibregl.Map | null>(null);

const sortedNearbyStations = computed(() => {
  if (!detectionResult.value?.nearbyStations) return [];
  return [...detectionResult.value.nearbyStations].sort((a, b) => a.distance - b.distance);
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const extractPlatform = (name: string | null | undefined): string | null => {
  if (!name) return null;
  const patterns = [
    /voie\s*(\d+)/i,
    /platform\s*(\d+)/i,
    /quai\s*(\d+)/i,
    /plateforme\s*(\d+)/i,
    /(\d+)\s*voie/i,
    /(\d+)\s*quai/i,
  ];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

const findTrainAtLocation = async (
  userLat: number,
  userLon: number,
  stopAreaId: string,
  userAccuracy: number
): Promise<DetectedTrain | null> => {
  try {
    const now = new Date();
    const nowStr = formatDateTime(now);

    const [departuresData, arrivalsData] = await Promise.all([
      getDepartures(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 }),
      getArrivals(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 })
    ]);

    const allTrains: Array<{ departure?: Departure; arrival?: Arrival; type: 'departure' | 'arrival' }> = [
      ...(departuresData.departures || []).map(d => ({ departure: d, type: 'departure' as const })),
      ...(arrivalsData.arrivals || []).map(a => ({ arrival: a, type: 'arrival' as const }))
    ];

    let bestMatch: DetectedTrain | null = null;
    let bestConfidence = 0;

    for (const train of allTrains) {
      const vehicleJourneyLink = (train.departure || train.arrival)?.links?.find(link =>
        link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
      );
      const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href;
      const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId);

      if (!vehicleJourneyId) continue;

      try {
        const vjData = await getVehicleJourney(vehicleJourneyId, 'sncf', 2);
        const vehicleJourney = vjData.data.vehicle_journeys?.[0];

        if (!vehicleJourney?.stop_times) continue;

        const stopTimes = vehicleJourney.stop_times as Array<StopTime & {
          base_arrival_date_time?: string;
          arrival_date_time?: string;
          base_departure_date_time?: string;
          departure_date_time?: string;
          stop_point?: any;
        }>;

        for (let i = 0; i < stopTimes.length; i++) {
          const stopTime = stopTimes[i];
          const stopPoint = stopTime.stop_point;
          const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;

          if (!coord?.lat || !coord?.lon) continue;

          const stopLat = coord.lat;
          const stopLon = coord.lon;
          const distance = calculateDistance(userLat, userLon, stopLat, stopLon);

          const arrivalTime = stopTime.arrival_date_time || stopTime.base_arrival_date_time || (stopTime as any).utc_arrival_time;
          const departureTime = stopTime.departure_date_time || stopTime.base_departure_date_time || (stopTime as any).utc_departure_time;

          if (arrivalTime || departureTime) {
            const timeStr = departureTime || arrivalTime;
            const stopDateTime = parseUTCDate(timeStr);
            const timeDiff = Math.abs(now.getTime() - stopDateTime.getTime());

            const maxDistance = userAccuracy + 50;
            const maxTimeDiff = 5 * 60 * 1000;

            if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
              const distanceScore = Math.max(0, 1 - (distance / maxDistance));
              const timeScore = Math.max(0, 1 - (timeDiff / maxTimeDiff));
              const confidence = (distanceScore * 0.6 + timeScore * 0.4) * 100;

              if (confidence > bestConfidence) {
                const displayInfo = (train.departure?.display_informations) ||
                  (train.arrival?.display_informations) ||
                  {
                    headsign: vehicleJourney.headsign || '',
                    trip_short_name: vehicleJourney.name || '',
                    network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                    direction: vehicleJourney.headsign || ''
                  };

                const nextStop = i < stopTimes.length - 1 ?
                  cleanLocationName(stopTimes[i + 1].stop_point?.name || stopTimes[i + 1].stop_point?.stop_area?.name) || 'Inconnu' :
                  'Terminus';

                bestMatch = {
                  vehicleJourneyId,
                  trainNumber: displayInfo?.headsign || displayInfo?.trip_short_name || 'N/A',
                  destination: displayInfo?.direction || 'Inconnu',
                  network: displayInfo?.network || 'SNCF',
                  currentStop: cleanLocationName(stopPoint?.name || stopPoint?.stop_area?.name) || 'Inconnu',
                  nextStop,
                  confidence: Math.round(confidence),
                  stopPoint: {
                    id: stopPoint?.id,
                    name: stopPoint?.name || undefined,
                    coord: { lat: stopLat, lon: stopLon }
                  }
                };
                bestConfidence = confidence;
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching vehicle journey ${vehicleJourneyId}:`, err);
        continue;
      }
    }

    return bestMatch;
  } catch (err) {
    console.error('Error finding train at location:', err);
    return null;
  }
};

const handleSelectStation = async (station: SelectedStation) => {
  selectedStation.value = station;
  detectingTrainForStation.value = true;
  error.value = null;

  try {
    const detectedTrain = await findTrainAtLocation(
      station.coord.lat,
      station.coord.lon,
      station.id,
      50
    );

    if (detectionResult.value) {
      detectionResult.value = {
        ...detectionResult.value,
        isInStation: true,
        station: {
          id: station.id,
          name: station.name,
          distance: station.distance,
          coord: station.coord
        },
        detectedTrain: detectedTrain || undefined
      };
    }
  } catch (err) {
    console.error('Error detecting train for selected station:', err);
    error.value = 'Erreur lors de la détection du train pour cette gare';
  } finally {
    detectingTrainForStation.value = false;
  }
};

const detectLocation = async (position: GeolocationPosition) => {
  loading.value = true;
  error.value = null;

  try {
    const { latitude, longitude, accuracy } = position.coords;

    const coordStr = `${longitude};${latitude}`;
    let response;
    try {
      response = await getPlacesNearby(coordStr, 'sncf', {
        type: ['stop_area', 'stop_point'],
        count: 10,
        distance: 10000,
        depth: 2
      });
    } catch (apiError: any) {
      if (apiError?.response?.status === 404) {
        try {
          response = await getPlacesNearby(coordStr, 'sncf', {
            count: 10,
            distance: 10000,
            depth: 2
          });
        } catch (fallbackError: any) {
          if (fallbackError?.response?.status === 404) {
            error.value = 'Aucune gare trouvée dans cette zone. L\'API SNCF ne couvre peut-être pas cette région.';
          } else {
            error.value = `Erreur API: ${fallbackError?.message || 'Erreur inconnue'}`;
          }
          loading.value = false;
          return;
        }
      } else {
        error.value = `Erreur lors de la recherche de gares: ${apiError?.message || 'Erreur inconnue'}`;
        loading.value = false;
        return;
      }
    }

    const stopAreas = response.stop_areas || [];
    const allStations: Array<{ type: 'stop_area' | 'stop_point'; data: any }> = [];
    for (const stopArea of stopAreas) {
      allStations.push({ type: 'stop_area', data: stopArea });
      if (stopArea.stop_points) {
        for (const stopPoint of stopArea.stop_points) {
          allStations.push({ type: 'stop_point', data: stopPoint });
        }
      }
    }

    const nearbyStations = allStations.map(({ type, data }) => {
      const coord = data.coord || data.stop_area?.coord;
      if (coord?.lat && coord?.lon) {
        const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
        return {
          id: data.id || data.stop_area?.id || '',
          name: cleanLocationName(data.name || data.stop_area?.name) || 'Gare inconnue',
          distance: Math.round(distance),
          coord: { lat: coord.lat, lon: coord.lon },
          type: type
        };
      }
      return null;
    }).filter((s): s is NonNullable<typeof s> => s !== null);

    if (allStations.length === 0) {
      detectionResult.value = {
        isInStation: false,
        userLocation: { lat: latitude, lon: longitude, accuracy },
        nearbyStations: []
      };
      loading.value = false;
      return;
    }

    let closestStation: { type: 'stop_area' | 'stop_point'; data: any } | null = null;
    let minDistance = Infinity;
    let closestStopPoint: { type: 'stop_area' | 'stop_point'; data: any } | null = null;

    for (const { type, data } of allStations) {
      const coord = data.coord || data.stop_area?.coord;
      if (coord?.lat && coord?.lon) {
        const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
        if (distance < minDistance) {
          minDistance = distance;
          if (type === 'stop_point') {
            closestStopPoint = { type, data };
            const parentStopArea = stopAreas.find((sa: any) =>
              sa.stop_points?.some((sp: any) => sp.id === data.id)
            );
            closestStation = parentStopArea
              ? { type: 'stop_area', data: parentStopArea }
              : { type, data };
          } else {
            closestStation = { type, data };
          }
        }
      }
    }

    if (!closestStation || minDistance > 200) {
      detectionResult.value = {
        isInStation: false,
        userLocation: { lat: latitude, lon: longitude, accuracy },
        nearbyStations
      };
      loading.value = false;
      updateMap();
      return;
    }

    const stationCoord = closestStation.data.coord || closestStation.data.stop_area?.coord;
    if (!stationCoord?.lat || !stationCoord?.lon) {
      error.value = 'Impossible de déterminer les coordonnées de la gare';
      loading.value = false;
      return;
    }

    const stationId = closestStation.data.id;
    if (!stationId) {
      error.value = 'Impossible de déterminer l\'ID de la gare';
      loading.value = false;
      return;
    }

    let platform: DetectionResult['platform'] | undefined;
    if (closestStopPoint) {
      const platformName = closestStopPoint.data.name || '';
      const platformNumber = extractPlatform(platformName);
      const platformCoord = closestStopPoint.data.coord;
      if (platformCoord?.lat && platformCoord?.lon) {
        platform = {
          id: closestStopPoint.data.id || '',
          name: platformName,
          coord: { lat: platformCoord.lat, lon: platformCoord.lon }
        };
      }
    }

    const detectedTrain = await findTrainAtLocation(
      latitude,
      longitude,
      stationId,
      accuracy
    );

    detectionResult.value = {
      isInStation: true,
      station: {
        id: stationId,
        name: cleanLocationName(closestStation.data.name) || 'Gare inconnue',
        distance: Math.round(minDistance),
        coord: { lat: stationCoord.lat, lon: stationCoord.lon }
      },
      platform,
      detectedTrain: detectedTrain || undefined,
      userLocation: { lat: latitude, lon: longitude, accuracy },
      nearbyStations
    };
    updateMap();
  } catch (err) {
    console.error('Error detecting location:', err);
    error.value = 'Erreur lors de la détection de votre position';
  } finally {
    loading.value = false;
  }
};

const handleDetectLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'La géolocalisation n\'est pas supportée par votre navigateur';
    return;
  }

  loading.value = true;
  error.value = null;

  navigator.geolocation.getCurrentPosition(
    detectLocation,
    (err) => {
      console.error('Geolocation error:', err);
      error.value = `Erreur de géolocalisation: ${err.message}`;
      loading.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

const handleStartWatching = () => {
  if (!navigator.geolocation) {
    error.value = 'La géolocalisation n\'est pas supportée par votre navigateur';
    return;
  }

  watchingLocation.value = true;
  loading.value = true;
  error.value = null;

  watchIdRef.value = navigator.geolocation.watchPosition(
    detectLocation,
    (err) => {
      console.error('Geolocation error:', err);
      error.value = `Erreur de géolocalisation: ${err.message}`;
      loading.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

const handleStopWatching = () => {
  if (watchIdRef.value !== null) {
    navigator.geolocation.clearWatch(watchIdRef.value);
    watchIdRef.value = null;
  }
  watchingLocation.value = false;
};

const handleStationHover = (e: MouseEvent, stationId: string) => {
  if (selectedStation.value?.id !== stationId) {
    (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
  }
};

const handleStationLeave = (e: MouseEvent, stationId: string) => {
  if (selectedStation.value?.id !== stationId) {
    (e.currentTarget as HTMLElement).style.backgroundColor = '';
  }
};

const updateMap = () => {
  if (!map.value || !detectionResult.value?.userLocation) return;

  const allPoints: Array<{ lat: number; lon: number }> = [
    { lat: detectionResult.value.userLocation.lat, lon: detectionResult.value.userLocation.lon }
  ];

  if (detectionResult.value.nearbyStations && detectionResult.value.nearbyStations.length > 0) {
    allPoints.push(...detectionResult.value.nearbyStations.map(s => s.coord));
  }

  if (detectionResult.value.station) {
    const alreadyIncluded = detectionResult.value.nearbyStations?.some(
      s => s.id === detectionResult.value.station?.id
    );
    if (!alreadyIncluded) {
      allPoints.push(detectionResult.value.station.coord);
    }
  }

  if (detectionResult.value.platform) {
    allPoints.push(detectionResult.value.platform.coord);
  }

  if (allPoints.length === 0) return;

  const lats = allPoints.map(p => p.lat);
  const lons = allPoints.map(p => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;
  const latPadding = Math.max(latRange * 0.15, 0.002);
  const lonPadding = Math.max(lonRange * 0.15, 0.002);

  const bounds: [[number, number], [number, number]] = [
    [minLon - lonPadding, minLat - latPadding],
    [maxLon + lonPadding, maxLat + latPadding]
  ];

  setTimeout(() => {
    try {
      map.value?.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 800,
        maxZoom: 16,
        minZoom: 12
      });
    } catch (err) {
      // Ignore fitBounds errors
    }
  }, 100);
};

onMounted(() => {
  if (!mapContainer.value) return;

  const center = detectionResult.value?.userLocation
    ? [detectionResult.value.userLocation.lon, detectionResult.value.userLocation.lat]
    : [2.3522, 48.8566];

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [{
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }]
    },
    center: center as [number, number],
    zoom: 14,
    attributionControl: { compact: true }
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.value.addControl(new maplibregl.GeolocateControl(), 'top-right');

  map.value.on('load', () => {
    isMapLoaded.value = true;
    updateMap();
  });

  watch(() => detectionResult.value, () => {
    if (isMapLoaded.value) {
      updateMap();
      addMarkers();
    }
  }, { deep: true });
});

const addMarkers = () => {
  if (!map.value || !detectionResult.value?.userLocation) return;

  // Remove existing markers
  const existingMarkers = document.querySelectorAll('.location-marker');
  existingMarkers.forEach(m => m.remove());

  // Add user location marker
  const userEl = document.createElement('div');
  userEl.className = 'location-marker';
  userEl.style.cssText = 'background-color: #00d1b2; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: default;';
  userEl.innerHTML = '<div style="width: 12px; height: 12px; border-radius: 50%; background-color: white;"></div>';
  new maplibregl.Marker({ element: userEl })
    .setLngLat([detectionResult.value.userLocation.lon, detectionResult.value.userLocation.lat])
    .addTo(map.value);

  // Add station markers
  if (detectionResult.value.nearbyStations) {
    detectionResult.value.nearbyStations.forEach((station, idx) => {
      const isClosest = detectionResult.value.station?.id === station.id;
      const stationEl = document.createElement('div');
      stationEl.className = 'location-marker';
      stationEl.style.cssText = `background-color: ${isClosest ? '#ff3860' : '#3273dc'}; width: ${isClosest ? 36 : 32}px; height: ${isClosest ? 36 : 32}px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;`;
      stationEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2c-4 0-8 .5-8 4v9.5c0 .95.38 1.81 1 2.44L3 22h3l.5-2h11l.5 2h3l-2-4.06c.62-.63 1-1.49 1-2.44V6c0-3.5-3.58-4-8-4zM5.5 16c-.83 0-1.5-.67-1.5-1.5S4.67 13 5.5 13s1.5.67 1.5 1.5S6.33 16 5.5 16zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-5H4V6h16v5z"/></svg>';
      stationEl.addEventListener('click', () => {
        selectedStationIndex.value = idx;
      });
      new maplibregl.Marker({ element: stationEl })
        .setLngLat([station.coord.lon, station.coord.lat])
        .addTo(map.value!);
    });
  }
};

onUnmounted(() => {
  if (watchIdRef.value !== null) {
    navigator.geolocation.clearWatch(watchIdRef.value);
  }
  if (map.value) {
    map.value.remove();
  }
});
</script>
