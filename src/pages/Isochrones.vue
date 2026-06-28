<template>
  <div>
    <PageHeader
      title="Isochrones"
      subtitle="Visualisez les zones accessibles selon un temps de trajet"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div class="notification is-warning mb-5">
          <p><strong>⚠️ Cette fonctionnalité est en version Beta</strong></p>
        </div>

        <div class="box mb-5">
          <h3 class="title is-5 mb-4">Calculer les isochrones</h3>
          <form @submit.prevent="handleSearch">
            <div class="field">
              <label class="label" for="from">Point de départ</label>
              <div class="control">
                <input
                  id="from"
                  class="input"
                  type="text"
                  v-model="from"
                  placeholder="admin:fr:75056 ou 2.3522;48.8566"
                  :disabled="loading"
                />
              </div>
              <p class="help">ID admin (ex: admin:fr:75056) ou coordonnées (ex: 2.3522;48.8566)</p>
            </div>

            <div class="field">
              <label class="label" for="maxDuration">Durée maximale (en secondes)</label>
              <div class="control">
                <input
                  id="maxDuration"
                  class="input"
                  type="number"
                  v-model="maxDuration"
                  placeholder="3600"
                  :disabled="loading"
                />
              </div>
              <p class="help">Durée maximale en secondes (ex: 3600 = 1 heure)</p>
            </div>

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="loading">
                  <span class="icon">
                    <Loader2 v-if="loading" :size="16" class="animate-spin" />
                    <Calculator v-else :size="16" />
                  </span>
                  <span>{{ loading ? 'Calcul...' : 'Calculer les isochrones' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-if="loading" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Calcul des isochrones...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <div v-if="!loading && isochrones" class="box">
          <h2 class="title is-4 mb-5">Résultats</h2>
          <div v-if="isochrones.isochrones && isochrones.isochrones.length > 0" class="mb-5">
            <GeoJSONMap
              :geojson-data="isochrones.isochrones"
              :style="getStyle"
              :height="500"
            />
          </div>
          <div class="content mb-4">
            <div
              v-for="(iso, index) in isochrones.isochrones"
              :key="index"
              class="box mb-3"
            >
              <strong>Isochrone {{ index + 1 }}:</strong>
              Durée maximale: {{ iso.max_duration ? `${Math.floor(iso.max_duration / 60)} minutes` : 'N/A' }}
            </div>
          </div>
          <details>
            <summary class="title is-6 mb-4" style="cursor: pointer">
              Afficher les données JSON
            </summary>
            <div class="content mt-4">
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
              }">{{ JSON.stringify(isochrones, null, 2) }}</pre>
            </div>
          </details>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Loader2, Calculator } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import GeoJSONMap from '@/components/GeoJSONMap.vue';
import { getIsochrones } from '@/services/navitiaApi';
import type { CoverageCoverageIsochronesGet200Response } from '@/client/models';

interface IsochroneFeature {
  max_duration?: number;
  [key: string]: unknown;
}

const from = ref<string>('');
const maxDuration = ref<string>('3600');
const isochrones = ref<CoverageCoverageIsochronesGet200Response | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const getStyle = (feature: unknown) => {
  const props = (feature as { properties?: IsochroneFeature })?.properties;
  const duration = props?.max_duration || 0;
  const hue = Math.max(0, 240 - (duration / 3600) * 60); // Blue to green gradient
  return {
    color: `hsl(${hue}, 70%, 50%)`,
    weight: 2,
    opacity: 0.8,
    fillColor: `hsl(${hue}, 70%, 50%)`,
    fillOpacity: 0.3
  };
};

const handleSearch = async (): Promise<void> => {
  if (!from.value.trim()) {
    error.value = 'Veuillez entrer un point de départ';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const data = await getIsochrones(from.value, null, 'sncf', {
      max_duration: parseInt(maxDuration.value) || 3600,
    });
    isochrones.value = data;
  } catch (err) {
    error.value = 'Erreur lors du calcul des isochrones';
    console.error(err);
    isochrones.value = null;
  } finally {
    loading.value = false;
  }
};
</script>
