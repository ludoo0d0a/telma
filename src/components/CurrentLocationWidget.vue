<template>
  <div
    class="card dashboard-card current-location-widget"
    :class="{ 'has-background-info': locationInfo.station && !locationInfo.loading && !locationInfo.error }"
    @click="handleClick"
  >
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <span
            :class="[
              'icon',
              'is-large',
              {
                'has-text-primary': locationInfo.loading,
                'has-text-warning': locationInfo.error,
                'has-text-grey': !locationInfo.station && !locationInfo.loading && !locationInfo.error,
                'has-text-white': locationInfo.station && !locationInfo.loading && !locationInfo.error,
              },
            ]"
          >
            <Loader2 v-if="locationInfo.loading" :size="32" class="animate-spin" />
            <AlertTriangle v-else-if="locationInfo.error" :size="32" />
            <Train v-else-if="locationInfo.train" :size="32" />
            <MapPin v-else :size="32" />
          </span>
        </div>
        <div class="media-content">
          <template v-if="locationInfo.loading">
            <p class="title is-5">Détection en cours...</p>
            <p class="subtitle is-6 has-text-secondary">Localisation de votre position</p>
          </template>
          <template v-else-if="locationInfo.error">
            <p class="title is-5">Position non détectée</p>
            <p class="subtitle is-6 has-text-secondary">Cliquez pour détecter votre position</p>
          </template>
          <template v-else-if="!locationInfo.station">
            <p class="title is-5">Aucune gare détectée</p>
            <p class="subtitle is-6 has-text-secondary">Cliquez pour détecter votre position</p>
          </template>
          <template v-else-if="locationInfo.train">
            <p class="title is-5 has-text-white">
              Train {{ locationInfo.train.number }}
            </p>
            <p class="subtitle is-6 has-text-white">
              <span class="icon is-small"><MapPin :size="16" /></span>
              {{ locationInfo.station.name }} • Destination: {{ locationInfo.train.destination }}
            </p>
          </template>
          <template v-else>
            <p class="title is-5 has-text-white">
              {{ locationInfo.station.name }}
            </p>
            <p class="subtitle is-6 has-text-white">
              <span class="icon is-small"><Ruler :size="16" /></span>
              À {{ locationInfo.station.distance }}m • Cliquez pour plus d'infos
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, AlertTriangle, MapPin, Train, Ruler } from 'lucide-vue-next';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '@/services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '@/services/vehicleJourneyService';
import { cleanLocationName } from '@/services/locationService';
import { parseUTCDate } from '@/utils/dateUtils';
import { DEFAULT_RADIUS_NEARBY, DEFAULT_RADIUS_NEARBY_LARGE } from '@/constants/location';
import type { StopAreasResponse } from '@/client';

interface CurrentLocationInfo {
  station?: {
    name: string;
    distance: number;
  };
  train?: {
    number: string;
    destination: string;
  };
  loading: boolean;
  error: string | null;
}

const router = useRouter();
const locationInfo = ref<CurrentLocationInfo>({
  loading: false,
  error: null,
});
const hasDetected = ref(false);

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

const findTrainAtLocation = async (
  userLat: number,
  userLon: number,
  stopAreaId: string
): Promise<{ number: string; destination: string } | null> => {
  try {
    const now = new Date();
    const nowStr = formatDateTime(now);

    const [departuresResponse, arrivalsResponse] = await Promise.all([
      getDepartures(stopAreaId, nowStr, 'sncf', { count: 5, depth: 2 }),
      getArrivals(stopAreaId, nowStr, 'sncf', { count: 5, depth: 2 }),
    ]);

    const allTrains = [
      ...(departuresResponse.departures || []),
      ...(arrivalsResponse.arrivals || []),
    ];

    for (const train of allTrains.slice(0, 3)) {
      const vehicleJourneyLink = train.links?.find(link =>
        link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
      );
      const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href;
      const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId);

      if (!vehicleJourneyId) continue;

      try {
        const vjResponse = await getVehicleJourney(vehicleJourneyId, 'sncf', 2);
        const vehicleJourney = vjResponse.data.vehicle_journeys?.[0];

        if (!vehicleJourney?.stop_times) continue;

        const stopTimes = vehicleJourney.stop_times as Array<any>;

        for (const stopTime of stopTimes) {
          const stopPoint = stopTime.stop_point;
          const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;

          if (!coord?.lat || !coord?.lon) continue;

          const distance = calculateDistance(userLat, userLon, coord.lat, coord.lon);
          const arrivalTime = stopTime.arrival_date_time || stopTime.base_arrival_date_time || stopTime.utc_arrival_time;
          const departureTime = stopTime.departure_date_time || stopTime.base_departure_date_time || stopTime.utc_departure_time;

          if (arrivalTime || departureTime) {
            const timeStr = departureTime || arrivalTime;
            const stopDateTime = parseUTCDate(timeStr);
            const timeDiff = Math.abs(now.getTime() - stopDateTime.getTime());

            if (distance < 100 && timeDiff < 5 * 60 * 1000) {
              const displayInfo = train.display_informations || {
                headsign: vehicleJourney.headsign || '',
                trip_short_name: vehicleJourney.name || '',
                network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                direction: vehicleJourney.headsign || '',
              };
              return {
                number: displayInfo?.headsign || displayInfo?.trip_short_name || 'N/A',
                destination: displayInfo?.direction || 'Inconnu',
              };
            }
          }
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  } catch (err) {
    console.error('Error finding train:', err);
    return null;
  }
};

const detectCurrentLocation = async () => {
  if (hasDetected.value) {
    return;
  }
  hasDetected.value = true;

  if (!navigator.geolocation) {
    locationInfo.value = {
      loading: false,
      error: 'Géolocalisation non supportée',
    };
    return;
  }

  locationInfo.value = { ...locationInfo.value, loading: true, error: null };

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });

    const { latitude, longitude } = position.coords;

    const coordStr = `${longitude};${latitude}`;
    let response: StopAreasResponse;
    try {
      response = await getPlacesNearby(coordStr, 'sncf', {
        type: ['stop_area', 'stop_point'],
        count: 5,
        distance: DEFAULT_RADIUS_NEARBY,
        depth: 2,
      });
    } catch (apiError: any) {
      if (apiError?.response?.status === 404) {
        try {
          response = await getPlacesNearby(coordStr, 'sncf', {
            type: ['stop_area', 'stop_point'],
            count: 5,
            distance: DEFAULT_RADIUS_NEARBY_LARGE,
            depth: 2,
          });
        } catch (fallbackError) {
          locationInfo.value = {
            loading: false,
            error: 'Zone non couverte',
          };
          return;
        }
      } else {
        locationInfo.value = {
          loading: false,
          error: 'Erreur de recherche',
        };
        return;
      }
    }

    const stations = response.stop_areas || [];
    if (stations.length === 0) {
      locationInfo.value = {
        loading: false,
        error: null,
      };
      return;
    }

    let closestStation: any = null;
    let minDistance = Infinity;

    for (const station of stations) {
      const coord = station.coord;
      if (coord?.lat && coord?.lon) {
        const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
        if (distance < minDistance) {
          minDistance = distance;
          closestStation = station;
        }
      }
    }

    if (!closestStation) {
      locationInfo.value = {
        loading: false,
        error: null,
        station: undefined,
        train: undefined,
      };
      return;
    }

    if (minDistance > 200) {
      locationInfo.value = {
        station: {
          name: cleanLocationName(
            closestStation.stop_area?.name ||
            closestStation.stop_point?.name ||
            closestStation.name
          ) || 'Gare inconnue',
          distance: Math.round(minDistance),
        },
        train: undefined,
        loading: false,
        error: null,
      };
      return;
    }

    const stationId = closestStation.stop_area?.id || closestStation.id;
    const stationName = cleanLocationName(
      closestStation.stop_area?.name ||
      closestStation.stop_point?.name ||
      closestStation.name
    ) || 'Gare inconnue';

    const train = await findTrainAtLocation(
      latitude,
      longitude,
      stationId
    );

    locationInfo.value = {
      station: {
        name: stationName,
        distance: Math.round(minDistance),
      },
      train: train || undefined,
      loading: false,
      error: null,
    };
  } catch (err: any) {
    console.error('Error detecting location:', err);
    locationInfo.value = {
      loading: false,
      error: err?.message || 'Erreur de détection',
    };
  }
};

onMounted(() => {
  detectCurrentLocation();
});

const handleClick = () => {
  router.push('/location-detection');
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

