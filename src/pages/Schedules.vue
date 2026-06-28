<template>
  <div>
    <PageHeader
      title="Horaires et planning"
      subtitle="Consultez les horaires par arrêt, ligne ou terminus"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="box mb-5">
          <h3 class="title is-5 mb-4">Type de planning</h3>
          <div class="tabs is-boxed mb-4">
            <ul>
              <li :class="{ 'is-active': scheduleType === 'stop' }">
                <a @click="setScheduleType('stop')">
                  <span class="icon is-small"><MapPin :size="16" /></span>
                  <span>Horaires d'arrêt</span>
                </a>
              </li>
              <li :class="{ 'is-active': scheduleType === 'route' }">
                <a @click="setScheduleType('route')">
                  <span class="icon is-small"><Route :size="16" /></span>
                  <span>Horaires de ligne</span>
                </a>
              </li>
              <li :class="{ 'is-active': scheduleType === 'terminus' }">
                <a @click="setScheduleType('terminus')">
                  <span class="icon is-small"><Flag :size="16" /></span>
                  <span>Horaires terminus</span>
                </a>
              </li>
            </ul>
          </div>

          <form @submit.prevent="handleSearch">
            <div class="field">
              <label class="label" for="filter">Filtre</label>
              <div class="control">
                <input
                  id="filter"
                  class="input"
                  type="text"
                  v-model="filter"
                  placeholder="stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1"
                  :disabled="loading"
                />
              </div>
              <p class="help">
                Exemples: stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1
              </p>
            </div>

            <div class="field">
              <label class="label" for="datetime">Date et heure (optionnel)</label>
              <div class="control">
                <input
                  id="datetime"
                  class="input"
                  type="text"
                  v-model="datetime"
                  placeholder="20250113T152944"
                  :disabled="loading"
                />
              </div>
              <p class="help">Format: YYYYMMDDTHHmmss (ex: 20250113T152944)</p>
            </div>

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="loading">
                  <span class="icon">
                    <Loader2 v-if="loading" :size="16" class="animate-spin" />
                    <Search v-else :size="16" />
                  </span>
                  <span>{{ loading ? 'Chargement...' : 'Rechercher' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-if="loading" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des horaires...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <div v-if="!loading && schedules" class="box">
          <h2 class="title is-4 mb-5">Résultats</h2>
          <div class="content">
            <div class="table-container">
              <pre :style="{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '1.5rem',
                overflow: 'auto',
                color: '#ccc',
                fontFamily: '\'Roboto Mono\', monospace',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }">{{ JSON.stringify(schedules, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MapPin, Route, Flag, Loader2, Search } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getStopSchedules, getRouteSchedules, getTerminusSchedules, formatDateTime } from '@/services/navitiaApi';
import type { StopSchedulesResponse, RouteSchedulesResponse, TerminusSchedulesResponse } from '@/client/models';

const scheduleType = ref<'stop' | 'route' | 'terminus'>('stop');
const filter = ref<string>('');
const datetime = ref<string>('');
const schedules = ref<StopSchedulesResponse | RouteSchedulesResponse | TerminusSchedulesResponse | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const setScheduleType = (type: 'stop' | 'route' | 'terminus') => {
  scheduleType.value = type;
  schedules.value = null;
  error.value = null;
};

const handleSearch = async (): Promise<void> => {
  if (!filter.value.trim()) {
    error.value = 'Veuillez entrer un filtre';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const searchDatetime = datetime.value || formatDateTime(new Date());
    let response;

    switch (scheduleType.value) {
      case 'stop':
        response = await getStopSchedules(filter.value, 'sncf', searchDatetime);
        break;
      case 'route':
        response = await getRouteSchedules(filter.value, 'sncf', searchDatetime);
        break;
      case 'terminus':
        response = await getTerminusSchedules(filter.value, 'sncf', searchDatetime);
        break;
      default:
        throw new Error('Type de planning invalide');
    }

    schedules.value = response;
  } catch (err) {
    error.value = 'Erreur lors de la récupération des horaires';
    console.error(err);
    schedules.value = null;
  } finally {
    loading.value = false;
  }
};
</script>
