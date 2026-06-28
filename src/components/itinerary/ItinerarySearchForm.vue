<template>
  <div class="box mb-5">
    <h3 class="title is-5 mb-4">Recherche d'itinéraire</h3>
    <div class="columns">
      <div class="column">
        <LocationAutocomplete
          label="Gare de départ"
          :value="fromName"
          @value-change="$emit('from-value-change', $event)"
          @change="$emit('from-change', $event)"
          :default-search-term="fromName || 'Metz'"
          @station-found="$emit('from-station-found', $event)"
          :disabled="loading"
        />
      </div>
      <div class="column is-narrow">
        <div class="field">
          <label class="label">&nbsp;</label>
          <div class="control">
            <button
              class="button is-light"
              @click="$emit('invert-itinerary')"
              :disabled="loading || !fromId || !toId"
              title="Inverser l'itinéraire"
            >
              <span class="icon">
                <ArrowLeftRight :size="20" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="column">
        <LocationAutocomplete
          label="Gare d'arrivée"
          :value="toName"
          @value-change="$emit('to-value-change', $event)"
          @change="$emit('to-change', $event)"
          :default-search-term="toName || 'Thionville'"
          @station-found="$emit('to-station-found', $event)"
          :disabled="loading"
        />
      </div>
    </div>
    <div class="columns mt-4">
      <div class="column is-narrow">
        <div class="field">
          <label class="label">Date</label>
          <div class="control">
            <input
              class="input"
              type="date"
              :value="filterDate"
              @input="$emit('filter-date-change', ($event.target as HTMLInputElement).value)"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
      <div class="column is-narrow">
        <div class="field">
          <label class="label">Heure</label>
          <div class="control">
            <input
              class="input"
              type="time"
              :value="filterTime"
              @input="$emit('filter-time-change', ($event.target as HTMLInputElement).value)"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
      <div class="column is-narrow">
        <div class="field">
          <label class="label">&nbsp;</label>
          <div class="control">
            <button
              class="button is-primary"
              @click="$emit('search')"
              :disabled="loading || !fromId || !toId"
            >
              <span class="icon"><Search :size="16" /></span>
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, ArrowLeftRight } from 'lucide-vue-next';
import LocationAutocomplete from '@/components/LocationAutocomplete.vue';
import type { Place } from '@/client/models/place';

interface Props {
  fromName: string;
  toName: string;
  fromId: string | undefined;
  toId: string | undefined;
  filterDate: string;
  filterTime: string;
  loading: boolean;
}

defineProps<Props>();

defineEmits<{
  'from-change': [id: string | undefined];
  'to-change': [id: string | undefined];
  'from-value-change': [value: string];
  'to-value-change': [value: string];
  'from-station-found': [station: Place & { name?: string | null }];
  'to-station-found': [station: Place & { name?: string | null }];
  'filter-date-change': [date: string];
  'filter-time-change': [time: string];
  'search': [];
  'invert-itinerary': [];
}>();
</script>

