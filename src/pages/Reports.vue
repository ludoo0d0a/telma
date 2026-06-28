<template>
  <div>
    <PageHeader
      title="Rapports et informations"
      subtitle="Téléchargez les rapports de ligne, trafic ou équipements"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="box mb-5">
          <h3 class="title is-5 mb-4">Type de rapport</h3>
          <div class="tabs is-boxed mb-4">
            <ul>
              <li :class="{ 'is-active': reportType === 'line' }">
                <a @click="setReportType('line')">
                  <span class="icon is-small"><Route :size="16" /></span>
                  <span>Rapports de ligne</span>
                </a>
              </li>
              <li :class="{ 'is-active': reportType === 'traffic' }">
                <a @click="setReportType('traffic')">
                  <span class="icon is-small"><TrafficCone :size="16" /></span>
                  <span>Rapports de trafic</span>
                </a>
              </li>
              <li :class="{ 'is-active': reportType === 'equipment' }">
                <a @click="setReportType('equipment')">
                  <span class="icon is-small"><Settings :size="16" /></span>
                  <span>Rapports d'équipement</span>
                </a>
              </li>
            </ul>
          </div>

          <form @submit.prevent="handleSearch">
            <div v-if="reportType === 'line' || reportType === 'equipment'" class="field">
              <label class="label" for="filter">
                Filtre {{ reportType === 'equipment' ? '(optionnel)' : '(requis)' }}
              </label>
              <div class="control">
                <input
                  id="filter"
                  class="input"
                  type="text"
                  v-model="filter"
                  placeholder="Ex: line.id=line:SNCF:1"
                  :disabled="loading"
                />
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="loading">
                  <span class="icon">
                    <Loader2 v-if="loading" :size="16" class="animate-spin" />
                    <Download v-else :size="16" />
                  </span>
                  <span>{{ loading ? 'Chargement...' : 'Récupérer les rapports' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-if="loading" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des rapports...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <div v-if="!loading && reports" class="box">
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
              }">{{ JSON.stringify(reports, null, 2) }}</pre>
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
import { Route, TrafficCone, Settings, Loader2, Download } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getLineReports, getTrafficReports, getEquipmentReports } from '@/services/navitiaApi';
import type {
  CoverageCoverageLineReportsGet200Response,
  CoverageCoverageTrafficReportsGet200Response,
  CoverageCoverageEquipmentReportsGet200Response
} from '@/client/models';

const reportType = ref<'line' | 'traffic' | 'equipment'>('traffic');
const filter = ref<string>('');
const reports = ref<CoverageCoverageLineReportsGet200Response | CoverageCoverageTrafficReportsGet200Response | CoverageCoverageEquipmentReportsGet200Response | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const setReportType = (type: 'line' | 'traffic' | 'equipment') => {
  reportType.value = type;
  reports.value = null;
  error.value = null;
};

const handleSearch = async (): Promise<void> => {
  if (reportType.value === 'line' && !filter.value.trim()) {
    error.value = 'Veuillez entrer un filtre pour les rapports de ligne';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    let response;
    switch (reportType.value) {
      case 'line':
        response = await getLineReports(filter.value);
        break;
      case 'traffic':
        response = await getTrafficReports();
        break;
      case 'equipment':
        response = await getEquipmentReports('sncf', filter.value || null);
        break;
      default:
        throw new Error('Type de rapport invalide');
    }

    reports.value = response;
  } catch (err) {
    error.value = 'Erreur lors de la récupération des rapports';
    console.error(err);
    reports.value = null;
  } finally {
    loading.value = false;
  }
};
</script>
