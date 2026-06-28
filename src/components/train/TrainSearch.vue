<template>
  <section class="section">
    <div class="container">
      <div class="box">
        <h1 class="title is-2 mb-5">Rechercher un train</h1>
        <p class="subtitle is-5 mb-5">
          Recherchez un train par son numéro ou son type (TGV, TER, etc.)
        </p>
        
        <!-- Advertisement -->
        <Ad format="horizontal" size="responsive" class="mb-5" />

        <div class="field" ref="wrapperRef">
          <label class="label">Numéro ou type de train</label>
          <div class="control has-icons-right">
            <input
              class="input is-large"
              type="text"
              v-model="searchQuery"
              @input="handleSearchChange"
              @focus="handleFocus"
              placeholder="Ex: 1234, TGV, TER..."
            />
            <span v-if="searchLoading" class="icon is-right">
              <Loader2 :size="20" class="animate-spin" />
            </span>
            <span v-else-if="searchQuery" class="icon is-right">
              <Search :size="20" />
            </span>
          </div>
          <div v-if="isSearchOpen && suggestions.length > 0" class="dropdown is-active" style="width: 100%; position: relative">
            <div class="dropdown-menu" style="width: 100%">
              <div class="dropdown-content" style="max-height: 400px; overflow-y: auto">
                <a
                  v-for="(train, index) in suggestions"
                  :key="train.id || index"
                  class="dropdown-item"
                  @click="handleSelectTrain(train)"
                  style="cursor: pointer"
                >
                  <div class="is-flex is-align-items-center">
                    <span :class="['icon', transportInfo(train).color, 'mr-3']">
                      <component :is="transportInfo(train).icon" :size="16" />
                    </span>
                    <div style="flex: 1">
                      <div class="is-flex is-align-items-center">
                        <strong class="mr-2">{{ getTrainNumber(train) }}</strong>
                        <span :class="['tag', transportInfo(train).tagColor, 'is-dark', 'is-small']">
                          {{ transportInfo(train).label }}
                        </span>
                      </div>
                      <small v-if="getDirection(train)" class="has-text-grey">{{ getDirection(train) }}</small>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <p v-if="searchQuery.length >= 2 && !searchLoading && suggestions.length === 0" class="help has-text-grey mt-2">
            Aucun train trouvé
          </p>
        </div>

        <!-- Samples Section -->
        <div class="mt-6">
          <h3 class="title is-4 mb-4">Exemples</h3>
          <div class="columns is-multiline">
            <div
              v-for="sampleId in sampleIds"
              :key="sampleId"
              class="column is-half"
            >
              <RouterLink
                :to="`/train/${encodeVehicleJourneyId(sampleId)}`"
                class="box is-clickable"
                style="text-decoration: none"
              >
                <div class="is-flex is-align-items-center">
                  <span class="icon is-large has-text-primary mr-3">
                    <TrainIcon :size="32" />
                  </span>
                  <div>
                    <p class="title is-5 mb-1">
                      Train {{ getParsedTrainNumber(sampleId) }}
                    </p>
                    <p class="subtitle is-6 mb-1">
                      <span class="tag is-dark mr-2">{{ getParsedVehicleType(sampleId) }}</span>
                      <span class="has-text-grey">{{ getParsedDate(sampleId) }}</span>
                    </p>
                    <p class="help">
                      ID: {{ getParsedId2(sampleId) }}
                    </p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
          <p class="help mt-2 has-text-grey">
            Cliquez sur un exemple pour voir les détails du train
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, Search, Train as TrainIcon } from 'lucide-vue-next';
import Ad from '@/components/Ad.vue';
import { autocompletePT } from '@/services/navitiaApi';
import { encodeVehicleJourneyId, parseVehicleJourneyId } from '@/utils/uriUtils';
import { getTransportIcon } from '@/services/transportService';
import type { ExtendedVehicleJourney } from './types';

const router = useRouter();
const searchQuery = ref<string>('');
const suggestions = ref<ExtendedVehicleJourney[]>([]);
const isSearchOpen = ref<boolean>(false);
const searchLoading = ref<boolean>(false);
const searchTimeoutRef = ref<NodeJS.Timeout | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

const sampleIds = [
  'vehicle_journey:SNCF:2025-12-18:88776:1187:Train',
  'vehicle_journey:SNCF:2025-12-18:88778:1187:Train'
];

onMounted(() => {
  const handleClickOutside = (event: MouseEvent): void => {
    if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
      isSearchOpen.value = false;
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
});

const searchTrains = async (query: string): Promise<void> => {
  if (!query || query.length < 2) {
    suggestions.value = [];
    isSearchOpen.value = false;
    return;
  }

  searchLoading.value = true;
  try {
    const data = await autocompletePT(query, 'sncf', 20);
    const ptObjects = ((data as unknown as { pt_objects?: Array<{ embedded_type?: string; vehicle_journey?: unknown }> }).pt_objects || []);
    const vehicleJourneys = ptObjects
      .filter((obj) => 
        (obj.embedded_type as string) === 'vehicle_journey' && obj.vehicle_journey
      )
      .map((obj) => obj.vehicle_journey as ExtendedVehicleJourney);
    suggestions.value = vehicleJourneys;
    isSearchOpen.value = vehicleJourneys.length > 0;
  } catch (err) {
    console.error('Error searching trains:', err);
    suggestions.value = [];
    isSearchOpen.value = false;
  } finally {
    searchLoading.value = false;
  }
};

const handleSearchChange = (e: Event): void => {
  const value = (e.target as HTMLInputElement).value;
  searchQuery.value = value;
  
  if (searchTimeoutRef.value) {
    clearTimeout(searchTimeoutRef.value);
  }
  
  searchTimeoutRef.value = setTimeout(() => {
    if (value.length >= 2) {
      searchTrains(value);
    } else {
      suggestions.value = [];
      isSearchOpen.value = false;
    }
  }, 300);
};

const handleFocus = (): void => {
  if (suggestions.value.length > 0) {
    isSearchOpen.value = true;
  }
};

const handleSelectTrain = (train: ExtendedVehicleJourney): void => {
  if (train.id) {
    router.push(`/train/${encodeVehicleJourneyId(train.id)}`);
  }
};

const getTrainNumber = (train: ExtendedVehicleJourney): string => {
  const displayInfo = train.display_informations || {};
  return displayInfo.headsign || displayInfo.trip_short_name || train.id || '';
};

const getDirection = (train: ExtendedVehicleJourney): string => {
  return train.display_informations?.direction || '';
};

const transportInfo = (train: ExtendedVehicleJourney) => {
  const displayInfo = train.display_informations || {};
  const commercialMode = displayInfo.commercial_mode || '';
  const network = displayInfo.network || '';
  return getTransportIcon(commercialMode, network);
};

const getParsedTrainNumber = (id: string): string => {
  const parsed = parseVehicleJourneyId(id);
  return parsed?.trainNumber || '';
};

const getParsedVehicleType = (id: string): string => {
  const parsed = parseVehicleJourneyId(id);
  return parsed?.vehicleType || '';
};

const getParsedDate = (id: string): string => {
  const parsed = parseVehicleJourneyId(id);
  return parsed?.date || '';
};

const getParsedId2 = (id: string): string => {
  const parsed = parseVehicleJourneyId(id);
  return parsed?.id2 || '';
};
</script>

