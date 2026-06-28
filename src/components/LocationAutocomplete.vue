<template>
  <div class="field" ref="wrapperRef">
    <label class="label">{{ label }}</label>
    <div class="field has-addons">
      <div class="control is-expanded has-icons-right">
        <input
          class="input"
          type="text"
          :value="inputValue"
          @input="handleInputChange"
          @focus="handleInputFocus"
          :placeholder="placeholder"
          :disabled="disabled || geolocating"
        />
        <span v-if="loading && !geolocating" class="icon is-right">
          <Loader2 :size="20" class="animate-spin" />
        </span>
        <span v-else-if="!loading && !geolocating && selectedStation" class="icon is-right has-text-success">
          <CheckCircle2 :size="20" />
        </span>
      </div>
      <div class="control">
        <button
          type="button"
          :class="['button', { 'is-loading': geolocating }]"
          @click="handleGetCurrentLocation"
          :disabled="disabled || geolocating || loading"
          title="Utiliser ma position actuelle"
        >
          <span class="icon">
            <Navigation :size="20" />
          </span>
        </button>
      </div>
    </div>
    <p v-if="geolocationError" class="help is-danger">{{ geolocationError }}</p>
    <div v-if="isOpen && suggestions.length > 0" class="dropdown is-active" style="width: 100%; position: relative">
      <div class="dropdown-menu" style="width: 100%">
        <div class="dropdown-content" style="max-height: 200px; overflow-y: auto">
          <a
            v-for="(station, index) in suggestions"
            :key="station.id || index"
            class="dropdown-item"
            @click="handleSelectStation(station)"
            style="cursor: pointer; display: flex; justify-content: space-between; align-items: center"
          >
            <div>
              <strong>{{ cleanLocationName(station.name) }}</strong>
              <span v-if="station.embedded_type" class="tag is-dark is-small ml-2">
                {{ station.embedded_type === 'stop_area' ? 'Gare' : 'Point d\'arrêt' }}
              </span>
            </div>
            <span
              class="icon"
              @click.stop="handleToggleFavorite(station)"
              style="cursor: pointer; margin-left: auto"
            >
              <Star :size="16" :class="isFavoriteStation(station) ? 'has-text-warning' : 'has-text-grey'" />
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Loader2, CheckCircle2, Navigation, Star } from 'lucide-vue-next';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import { getFavorites, addFavorite, removeFavorite, isFavorite, sortFavoritesFirst } from '@/services/favoritesService';
import { cleanLocationName } from '@/services/locationService';
import type { Place } from '@/client/models/place';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  defaultSearchTerm?: string | null;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher une gare...',
  defaultSearchTerm: null,
  disabled: false
});

const emit = defineEmits<{
  'value-change': [value: string];
  'change': [id: string | undefined];
  'station-found': [station: Place & { name?: string | null }];
}>();

const suggestions = ref<Place[]>([]);
const isOpen = ref<boolean>(false);
const loading = ref<boolean>(false);
const geolocating = ref<boolean>(false);
const geolocationError = ref<string | null>(null);
const selectedStation = ref<Place | null>(null);
const favoriteIds = ref<Set<string>>(new Set());
const wrapperRef = ref<HTMLElement | null>(null);
const searchTimeoutRef = ref<NodeJS.Timeout | null>(null);
const inputValue = ref<string>(props.value);
const hasUserInteracted = ref<boolean>(false);

onMounted(async () => {
  const favorites = await getFavorites();
  favoriteIds.value = new Set(favorites.map(f => f.id));
  
  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
  
  // Perform default search
  if (props.defaultSearchTerm && props.defaultSearchTerm.length >= 2 && !selectedStation.value && !hasUserInteracted.value) {
    loading.value = true;
    try {
      const data = await searchPlaces(props.defaultSearchTerm!, 'sncf', { count: 20 });
      const stations = data.places?.filter(place =>
        place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
      ) || [];

      if (stations.length > 0) {
        const sortedStations = await sortFavoritesFirst(stations);
        handleSelectStation(sortedStations[0]);
      }
    } catch (error) {
      console.error('Error searching default place:', error);
    } finally {
      loading.value = false;
    }
  }
});

watch(() => props.value, (newValue) => {
  if (!hasUserInteracted.value) {
    inputValue.value = newValue;
  }
});

const handleSelectStation = async (station: Place): Promise<void> => {
  const cleanedName = cleanLocationName(station.name);
  const newValue = cleanedName || '';
  inputValue.value = newValue;
  emit('value-change', newValue);
  selectedStation.value = station;
  isOpen.value = false;
  geolocationError.value = null;
  emit('change', station.id);
  hasUserInteracted.value = false;
  emit('station-found', { ...station, name: cleanedName });
};

const searchStation = async (searchTerm: string, autoSelect: boolean = false): Promise<void> => {
  if (!searchTerm || searchTerm.length < 2) {
    suggestions.value = [];
    isOpen.value = false;
    return;
  }

  loading.value = true;
  try {
    const data = await searchPlaces(searchTerm, 'sncf', { count: 20 });
    const stations = data.places?.filter(place =>
      place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
    ) || [];

    const sortedStations = await sortFavoritesFirst(stations);
    suggestions.value = sortedStations;
    isOpen.value = sortedStations.length > 0 && !autoSelect;

    if (autoSelect && sortedStations.length > 0 && !selectedStation.value) {
      handleSelectStation(sortedStations[0]);
    }
  } catch (error) {
    console.error('Error searching places:', error);
    suggestions.value = [];
    isOpen.value = false;
  } finally {
    loading.value = false;
  }
};

const handleInputChange = (e: Event): void => {
  const newValue = (e.target as HTMLInputElement).value;
  inputValue.value = newValue;
  hasUserInteracted.value = true;
  emit('value-change', newValue);
  selectedStation.value = null;
  geolocationError.value = null;

  if (searchTimeoutRef.value) {
    clearTimeout(searchTimeoutRef.value);
  }

  searchTimeoutRef.value = setTimeout(() => {
    if (newValue.length >= 2) {
      searchStation(newValue);
    } else {
      suggestions.value = [];
      isOpen.value = false;
    }
  }, 300);
};

const handleToggleFavorite = async (station: Place): Promise<void> => {
  const stationId = station.id;
  if (!stationId) return;

  const isFav = await isFavorite(stationId);

  if (isFav) {
    await removeFavorite(stationId);
  } else {
    await addFavorite(stationId, station.name || '', station.embedded_type || '');
  }

  const favorites = await getFavorites();
  favoriteIds.value = new Set(favorites.map(f => f.id));
  
  const sortedStations = await sortFavoritesFirst(suggestions.value);
  suggestions.value = sortedStations;
};

const isFavoriteStation = (station: Place): boolean => {
  return station.id ? favoriteIds.value.has(station.id) : false;
};

const handleInputFocus = (): void => {
  if (suggestions.value.length > 0) {
    isOpen.value = true;
  }
};

const handleGetCurrentLocation = async (): Promise<void> => {
  if (!navigator.geolocation) {
    geolocationError.value = 'La géolocalisation n\'est pas supportée par votre navigateur';
    return;
  }

  geolocating.value = true;
  geolocationError.value = null;
  loading.value = true;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    const { latitude, longitude } = position.coords;

    const coordStr = `${longitude};${latitude}`;
    const data = await getPlacesNearby(coordStr, 'sncf', {
      type: ['stop_area', 'stop_point'],
      count: 20,
      distance: 2000
    });

    const stations = (data.stop_areas || []).map(stopArea => ({
      ...stopArea,
      embedded_type: 'stop_area' as const
    })).filter(place =>
      place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
    );

    if (stations.length > 0) {
      const sortedStations = await sortFavoritesFirst(stations);
      suggestions.value = sortedStations;
      isOpen.value = true;

      if (sortedStations.length > 0) {
        handleSelectStation(sortedStations[0]);
      }
    } else {
      geolocationError.value = 'Aucune gare trouvée à proximité';
    }
  } catch (error) {
    console.error('Error getting location:', error);
    if (error && typeof error === 'object' && 'code' in error) {
      const geoError = error as GeolocationPositionError;
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          geolocationError.value = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
          break;
        case geoError.POSITION_UNAVAILABLE:
          geolocationError.value = 'Impossible de déterminer votre position';
          break;
        case geoError.TIMEOUT:
          geolocationError.value = 'La demande de géolocalisation a expiré';
          break;
        default:
          geolocationError.value = 'Erreur lors de la géolocalisation';
      }
    } else {
      geolocationError.value = 'Erreur lors de la recherche de gares à proximité';
    }
  } finally {
    geolocating.value = false;
    loading.value = false;
  }
};
</script>

