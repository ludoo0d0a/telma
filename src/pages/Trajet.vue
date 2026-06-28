<template>
  <div>
    <PageHeader
      title="Recherche de trains"
      subtitle="Planifiez vos trajets TER et visualisez les perturbations"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="level mb-5 is-justify-content-flex-end">
          <div class="level-item">
            <button
              class="button is-primary"
              @click="handleRefresh"
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

        <!-- Advertisement -->
        <Ad format="horizontal" size="responsive" class="mb-5" />

        <ItinerarySearchForm
          :from-name="fromName"
          :to-name="toName"
          :from-id="fromId"
          :to-id="toId"
          :filter-date="filterDate"
          :filter-time="filterTime"
          :loading="loading"
          @from-change="setFromId"
          @to-change="setToId"
          @from-value-change="handleFromValueChange"
          @to-value-change="handleToValueChange"
          @from-station-found="handleFromStationFound"
          @to-station-found="handleToStationFound"
          @filter-date-change="setFilterDate"
          @filter-time-change="setFilterTime"
          @search="handleSearch"
          @invert-itinerary="handleInvertItinerary"
        />

        <div v-if="loading" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des trains...</p>
          <p class="has-text-grey">Recherche des gares et des horaires en cours...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
          <p class="mt-3 has-text-grey-light">
            <template v-if="fromId && toId">
              Gares trouvées mais impossible de récupérer les horaires.
            </template>
            <template v-else>
              Vérifiez votre connexion et réessayez.
            </template>
          </p>
        </div>

        <DisruptionsList v-if="!loading" :disruptions="disruptions" />

        <template v-if="!loading && !error && terTrains.length > 0">
          <!-- Advertisement -->
          <Ad format="auto" size="responsive" class="mb-5" />

          <JourneyTable
            :journeys="terTrains"
            :get-journey-info="(journey) => getJourneyInfo(journey, fromName, toName)"
            :get-journey-disruptions="getJourneyDisruptions"
            :generate-trip-id="generateTripId"
            @detail-click="handleDetailClick"
          />

          <!-- Advertisement -->
          <Ad format="rectangle" size="responsive" class="mb-5" />
        </template>

        <EmptyState
          v-if="!loading && !error && terTrains.length === 0"
          :from-name="fromName"
          :to-name="toName"
          :from-id="fromId"
          :to-id="toId"
        />
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, RefreshCw } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import Ad from '@/components/Ad.vue';
import { PageHeader } from '@/components/skytrip';
import ItinerarySearchForm from '@/components/itinerary/ItinerarySearchForm.vue';
import DisruptionsList from '@/components/itinerary/DisruptionsList.vue';
import JourneyTable from '@/components/itinerary/JourneyTable.vue';
import EmptyState from '@/components/itinerary/EmptyState.vue';
import { getJourneys, formatDateTime } from '@/services/navitiaApi';
import { parseUTCDate } from '@/utils/dateUtils';
import { cleanLocationName } from '@/services/locationService';
import { getJourneyInfo, type JourneyInfo } from '@/services/journeyService';
import { doesDisruptionMatchSectionByTrip, doesDisruptionMatchSectionByStopPoint } from '@/services/disruptionService';
import { encodeTripId } from '@/utils/uriUtils';
import type { JourneyItem } from '@/client/models/journey-item';
import type { Disruption } from '@/client/models/disruption';
import type { Section } from '@/client/models/section';
import type { Place } from '@/client/models/place';
import type { ImpactApplicationPeriodsInner } from '@/client/models/impact-application-periods-inner';

const route = useRoute();
const router = useRouter();

const decodeLocationName = (slug: string | undefined): string => {
  if (!slug) return '';
  return decodeURIComponent(slug).replace(/-/g, ' ').split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const terTrains = ref<JourneyItem[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const fromId = ref<string | undefined>(undefined);
const toId = ref<string | undefined>(undefined);
const disruptions = ref<Disruption[]>([]);

const hasAutoSearched = ref<boolean>(false);
const isInitialLoadFromUrl = ref<boolean>(false);
const userHasChangedValues = ref<boolean>(false);
const initialFromName = ref<string>('');
const initialToName = ref<string>('');

const fromParam = computed(() => route.params.from as string | undefined);
const toParam = computed(() => route.params.to as string | undefined);

const fromName = ref<string>('');
const toName = ref<string>('');

const getDefaultDateTime = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() - 1);
  return now;
};

const defaultDate = getDefaultDateTime();
const filterDate = ref<string>(defaultDate.toISOString().split('T')[0]);
const hours = String(defaultDate.getHours()).padStart(2, '0');
const minutes = String(defaultDate.getMinutes()).padStart(2, '0');
const filterTime = ref<string>(`${hours}:${minutes}`);

// Initialize from URL params
onMounted(() => {
  if (fromParam.value) {
    const decodedFrom = decodeLocationName(fromParam.value);
    fromName.value = decodedFrom;
    initialFromName.value = decodedFrom;
  }
  if (toParam.value) {
    const decodedTo = decodeLocationName(toParam.value);
    toName.value = decodedTo;
    initialToName.value = decodedTo;
  }
  isInitialLoadFromUrl.value = Boolean(fromParam.value && toParam.value);
});

// Watch URL params
watch([fromParam, toParam], () => {
  if (fromParam.value) {
    const decodedFrom = decodeLocationName(fromParam.value);
    fromName.value = decodedFrom;
    initialFromName.value = decodedFrom;
  }
  if (toParam.value) {
    const decodedTo = decodeLocationName(toParam.value);
    toName.value = decodedTo;
    initialToName.value = decodedTo;
  }
  hasAutoSearched.value = false;
  isInitialLoadFromUrl.value = Boolean(fromParam.value && toParam.value);
  userHasChangedValues.value = false;
});

// Auto-search when both stations are resolved
watch([fromId, toId], () => {
  if (
    isInitialLoadFromUrl.value &&
    fromId.value &&
    toId.value &&
    !hasAutoSearched.value &&
    !userHasChangedValues.value
  ) {
    hasAutoSearched.value = true;
    fetchTerTrains(fromId.value, toId.value);
  }
  
  if (userHasChangedValues.value) {
    terTrains.value = [];
    disruptions.value = [];
    error.value = null;
  }
});

const handleFromStationFound = (station: Place & { name?: string | null }): void => {
  if (!station.id) return;

  const cleanedName = cleanLocationName(station.name) || '';
  const normalizedCleanedName = cleanedName.toLowerCase().trim();
  const normalizedInitialFrom = initialFromName.value.toLowerCase().trim();

  const isManualChange =
    userHasChangedValues.value ||
    hasAutoSearched.value ||
    (normalizedCleanedName !== normalizedInitialFrom && isInitialLoadFromUrl.value);

  if (isManualChange) {
    userHasChangedValues.value = true;
    if (hasAutoSearched.value) {
      terTrains.value = [];
      disruptions.value = [];
    }
  }

  fromId.value = station.id;
  fromName.value = cleanedName;
  error.value = null;

  if (toId.value && toName.value) {
    const fromSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
    const toSlug = encodeURIComponent(toName.value.toLowerCase().replace(/\s+/g, '-'));
    router.replace(`/itinerary/${fromSlug}/${toSlug}`);
  }
};

const handleToStationFound = (station: Place & { name?: string | null }): void => {
  if (!station.id) return;

  const cleanedName = cleanLocationName(station.name) || '';
  const normalizedCleanedName = cleanedName.toLowerCase().trim();
  const normalizedInitialTo = initialToName.value.toLowerCase().trim();

  const isManualChange =
    userHasChangedValues.value ||
    hasAutoSearched.value ||
    (normalizedCleanedName !== normalizedInitialTo && isInitialLoadFromUrl.value);

  if (isManualChange) {
    userHasChangedValues.value = true;
    if (hasAutoSearched.value) {
      terTrains.value = [];
      disruptions.value = [];
    }
  }

  toId.value = station.id;
  toName.value = cleanedName;
  error.value = null;

  if (fromId.value && fromName.value) {
    const fromSlug = encodeURIComponent(fromName.value.toLowerCase().replace(/\s+/g, '-'));
    const toSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
    router.replace(`/itinerary/${fromSlug}/${toSlug}`);
  }
};

const handleFromValueChange = (value: string): void => {
  fromName.value = value;
  if (hasAutoSearched.value || value !== initialFromName.value) {
    userHasChangedValues.value = true;
  }
};

const handleToValueChange = (value: string): void => {
  toName.value = value;
  if (hasAutoSearched.value || value !== initialToName.value) {
    userHasChangedValues.value = true;
  }
};

const handleSearch = (): void => {
  if (fromId.value && toId.value) {
    fetchTerTrains(fromId.value, toId.value);
  } else {
    error.value = 'Veuillez sélectionner les gares de départ et d\'arrivée';
  }
};

const handleInvertItinerary = (): void => {
  if (!fromId.value || !toId.value) return;

  const newFromId = toId.value;
  const newFromName = toName.value;
  const newToId = fromId.value;
  const newToName = fromName.value;

  fromId.value = newFromId;
  fromName.value = newFromName;
  toId.value = newToId;
  toName.value = newToName;

  const fromSlug = encodeURIComponent(newFromName.toLowerCase().replace(/\s+/g, '-'));
  const toSlug = encodeURIComponent(newToName.toLowerCase().replace(/\s+/g, '-'));
  router.replace(`/itinerary/${fromSlug}/${toSlug}`);

  fetchTerTrains(newFromId, newToId);
};

const fetchTerTrains = async (from: string, to: string): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    disruptions.value = [];

    const [hours, minutes] = filterTime.value.split(':');
    const filterDateTime = new Date(filterDate.value);
    filterDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const searchDatetime = formatDateTime(filterDateTime);

    const allJourneys: JourneyItem[] = [];
    const allDisruptions: Disruption[] = [];
    const filterDateObj = new Date(filterDate.value);

    for (let day = 0; day < 3; day++) {
      const date = new Date(filterDateObj);
      date.setDate(date.getDate() + day);

      if (day === 0) {
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        date.setHours(0, 0, 0, 0);
      }

      const dayDatetime = formatDateTime(date);
      const data = await getJourneys(from, to, dayDatetime, 'sncf', {
        count: 100,
        data_freshness: 'realtime'
      });
      if (data.journeys) {
        allJourneys.push(...data.journeys);
      }

      if (data.disruptions && Array.isArray(data.disruptions)) {
        allDisruptions.push(...data.disruptions);
      }
    }

    disruptions.value = allDisruptions;

    const filterDateTimeMs = filterDateTime.getTime();
    const filteredJourneys = allJourneys.filter((journey: JourneyItem) => {
      if (!journey.departure_date_time) return false;
      const journeyDate = parseUTCDate(journey.departure_date_time);
      return journeyDate.getTime() >= filterDateTimeMs;
    });

    const allTransportTypes = filteredJourneys.filter((journey: JourneyItem) => {
      return journey.sections?.some((section: Section) => section.type === 'public_transport');
    });

    const uniqueTrains: JourneyItem[] = [];
    const seenIds = new Set<string>();

    allTransportTypes.forEach((journey: JourneyItem) => {
      const firstSection = journey.sections?.find((s: Section) => s.type === 'public_transport');
      if (firstSection) {
        const trainId = firstSection.display_informations?.headsign ||
                       firstSection.display_informations?.trip_short_name ||
                       journey.departure_date_time || '';

        if (!seenIds.has(trainId)) {
          seenIds.add(trainId);
          uniqueTrains.push(journey);
        }
      }
    });

    uniqueTrains.sort((a: JourneyItem, b: JourneyItem) => {
      const timeA = a.departure_date_time ? parseUTCDate(a.departure_date_time).getTime() : 0;
      const timeB = b.departure_date_time ? parseUTCDate(b.departure_date_time).getTime() : 0;
      return timeA - timeB;
    });

    terTrains.value = uniqueTrains;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    error.value = 'Erreur lors de la récupération des trains TER: ' + errorMessage;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const generateTripId = (journey: JourneyItem, journeyInfo: JourneyInfo): string => {
  if (journeyInfo.vehicleJourneyId && journey.departure_date_time) {
    const tripKey = `${journeyInfo.vehicleJourneyId}_${journey.departure_date_time}`;
    return encodeTripId(tripKey);
  }
  const tripKey = `${journey.departure_date_time}_${journeyInfo.departureStation}_${journeyInfo.arrivalStation}_${journeyInfo.trainNumber}`;
  return encodeTripId(tripKey);
};

const getJourneyDisruptions = (journey: JourneyItem, journeyInfo: JourneyInfo): Disruption[] => {
  if (!disruptions.value || disruptions.value.length === 0) return [];

  const matchedDisruptions: Disruption[] = [];
  const vehicleJourneyId = journeyInfo.vehicleJourneyId;
  const departureTime = journey.departure_date_time;
  const sections = journey.sections || [];

  const disruptionLinkIds = new Set<string>();
  sections.forEach((section: Section) => {
    if (section.type === 'public_transport') {
      const sectionLinks = section.links?.filter((link) =>
        link.type === 'disruption'
      ) || [];
      sectionLinks.forEach((link) => {
        if (link.id) {
          disruptionLinkIds.add(link.id);
        }
      });
    }
  });

  const matchedByLink: Disruption[] = [];
  if (disruptionLinkIds.size > 0) {
    disruptions.value.forEach((disruption: Disruption) => {
      const disruptionId = disruption.disruption_uri || disruption.id || disruption.disruption_id;
      if (disruptionId && disruptionLinkIds.has(disruptionId)) {
        matchedByLink.push(disruption);
      }
    });
  }

  if (matchedByLink.length > 0) {
    return matchedByLink.filter((disruption: Disruption) => {
      if (disruption.application_periods && Array.isArray(disruption.application_periods) && disruption.application_periods.length > 0) {
        if (!departureTime) return false;
        const journeyTime = parseUTCDate(departureTime).getTime();
        return disruption.application_periods.some((period: ImpactApplicationPeriodsInner) => {
          if (!period.begin || !period.end) return true;
          const beginTime = new Date(period.begin).getTime();
          const endTime = new Date(period.end).getTime();
          return journeyTime >= beginTime && journeyTime <= endTime;
        });
      }
      return true;
    });
  }

  disruptions.value.forEach((disruption: Disruption) => {
    let isMatch = false;

    if (disruption.impacted_objects && Array.isArray(disruption.impacted_objects)) {
      disruption.impacted_objects.forEach((obj) => {
        const ptObject = obj.pt_object;
        if (!ptObject) return;

        if (vehicleJourneyId && ptObject.id && ptObject.id === vehicleJourneyId) {
          isMatch = true;
        }

        if (ptObject.embedded_type === 'vehicle_journey' && vehicleJourneyId && ptObject.id === vehicleJourneyId) {
          isMatch = true;
        }

        sections.forEach((section: Section) => {
          if (section.type === 'public_transport') {
            const sectionTripId = section.trip?.id || (section.vehicle_journey && typeof section.vehicle_journey === 'object' && 'trip' in section.vehicle_journey ? (section.vehicle_journey as { trip?: { id?: string } }).trip?.id : undefined);
            if (sectionTripId && doesDisruptionMatchSectionByTrip(disruption, sectionTripId)) {
              isMatch = true;
            }
          }
        });

        const stopPointIds: string[] = [];
        sections.forEach((section: Section) => {
          if (section.type === 'public_transport') {
            const fromStopId = section.from?.stop_point?.id || section.from?.stop_area?.id;
            const toStopId = section.to?.stop_point?.id || section.to?.stop_area?.id;
            if (fromStopId) stopPointIds.push(fromStopId);
            if (toStopId) stopPointIds.push(toStopId);

            if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
              section.stop_date_times.forEach((stopTime) => {
                const intermediateStopId = stopTime.stop_point?.id || stopTime.stop_area?.id;
                if (intermediateStopId) stopPointIds.push(intermediateStopId);
              });
            }
          }
        });
        if (stopPointIds.length > 0 && doesDisruptionMatchSectionByStopPoint(disruption, stopPointIds)) {
          isMatch = true;
        }
      });
    }

    if (isMatch && disruption.application_periods && Array.isArray(disruption.application_periods) && disruption.application_periods.length > 0) {
      if (!departureTime) {
        isMatch = false;
      } else {
        const journeyTime = parseUTCDate(departureTime).getTime();
        const isInPeriod = disruption.application_periods.some((period: ImpactApplicationPeriodsInner) => {
          if (!period.begin || !period.end) return true;
          const beginTime = new Date(period.begin).getTime();
          const endTime = new Date(period.end).getTime();
          return journeyTime >= beginTime && journeyTime <= endTime;
        });
        if (!isInPeriod) {
          isMatch = false;
        }
      }
    }

    if (isMatch) {
      matchedDisruptions.push(disruption);
    }
  });

  return matchedDisruptions;
};

const handleDetailClick = (journey: JourneyItem, journeyInfo: JourneyInfo, journeyDisruptions: Disruption[], tripId: string): void => {
  sessionStorage.setItem(`trip_${tripId}`, JSON.stringify({
    journey,
    info: journeyInfo,
    disruptions: journeyDisruptions
  }));
};

const handleRefresh = async (): Promise<void> => {
  if (fromId.value && toId.value) {
    await fetchTerTrains(fromId.value, toId.value);
  } else {
    error.value = 'Veuillez sélectionner les gares de départ et d\'arrivée';
  }
};
</script>
