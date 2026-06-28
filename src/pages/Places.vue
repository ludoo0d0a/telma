<template>
  <div>
    <PageHeader
      title="Recherche de lieux"
      subtitle="Trouvez les gares et arrêts à proximité ou par mot-clé"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <!-- Advertisement -->
        <Ad format="horizontal" size="responsive" class="mb-5" />

        <div class="box mb-5">
          <h3 class="title is-5 mb-4">Type de recherche</h3>
          <div class="tabs is-boxed mb-4">
            <ul>
              <li :class="{ 'is-active': searchType === 'text' }">
                <a @click="setSearchType('text')">
                  <span class="icon is-small"><Search :size="16" /></span>
                  <span>Recherche par texte</span>
                </a>
              </li>
              <li :class="{ 'is-active': searchType === 'nearby' }">
                <a @click="setSearchType('nearby')">
                  <span class="icon is-small"><MapPin :size="16" /></span>
                  <span>Recherche par coordonnées</span>
                </a>
              </li>
            </ul>
          </div>

          <form v-if="searchType === 'text'" @submit.prevent="handleTextSearch">
            <div class="field">
              <label class="label" for="search">Rechercher un lieu</label>
              <div class="control">
                <input
                  id="search"
                  class="input"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Ex: Paris, Gare du Nord..."
                  :disabled="loading"
                />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="loading">
                  <span class="icon">
                    <Loader2 v-if="loading" :size="16" class="animate-spin" />
                    <Search v-else :size="16" />
                  </span>
                  <span>{{ loading ? 'Recherche...' : 'Rechercher' }}</span>
                </button>
              </div>
            </div>
          </form>

          <form v-else @submit.prevent="handleNearbySearch">
            <div class="field">
              <label class="label" for="coord">Coordonnées (format: lon;lat)</label>
              <div class="control">
                <input
                  id="coord"
                  class="input"
                  type="text"
                  v-model="coordQuery"
                  placeholder="Ex: 2.3522;48.8566"
                  :disabled="loading"
                />
              </div>
              <p class="help">Format: longitude;latitude (ex: 2.3522;48.8566 pour Paris)</p>
            </div>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="loading">
                  <span class="icon">
                    <Loader2 v-if="loading" :size="16" class="animate-spin" />
                    <Search v-else :size="16" />
                  </span>
                  <span>{{ loading ? 'Recherche...' : 'Rechercher' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-if="loading" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des lieux...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <template v-if="!loading && places.length > 0">
          <!-- Advertisement -->
          <Ad format="auto" size="responsive" class="mb-5" />
          
          <div class="box">
            <h2 class="title is-4 mb-5">
              Résultats <span class="tag is-primary is-medium">{{ places.length }}</span>
            </h2>
            <div class="columns is-multiline">
              <div
                v-for="(place, index) in places"
                :key="place.id || index"
                class="column is-half is-half-mobile"
              >
                <div class="box">
                  <h3 class="title is-5 mb-3">{{ place.name || 'Sans nom' }}</h3>
                  <div class="content">
                    <p><strong>Type:</strong> {{ place.embedded_type || 'N/A' }}</p>
                    <p v-if="place.id"><strong>ID:</strong> <code>{{ place.id }}</code></p>
                    <p v-if="place.administrative_regions && place.administrative_regions.length > 0">
                      <strong>Région:</strong> {{ place.administrative_regions[0].name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Advertisement -->
          <Ad format="rectangle" size="responsive" class="mb-5" />
        </template>

        <div v-if="!loading && places.length === 0 && !error && searchQuery" class="box has-text-centered">
          <div class="content">
            <span class="icon is-large has-text-warning mb-4" style="font-size: 4rem">📍</span>
            <h2 class="title is-4">Aucun résultat trouvé</h2>
            <p class="subtitle is-6 has-text-grey">
              Aucun lieu ne correspond à votre recherche.
            </p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, MapPin, Loader2 } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import Ad from '@/components/Ad.vue';
import { PageHeader } from '@/components/skytrip';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import type { Place } from '@/client/models/place';

const searchQuery = ref<string>('');
const coordQuery = ref<string>('');
const places = ref<Place[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const searchType = ref<'text' | 'nearby'>('text');

const setSearchType = (type: 'text' | 'nearby') => {
  searchType.value = type;
  places.value = [];
  error.value = null;
};

const handleTextSearch = async (): Promise<void> => {
  if (!searchQuery.value.trim()) {
    error.value = 'Veuillez entrer un terme de recherche';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const data = await searchPlaces(searchQuery.value);
    places.value = data.places || [];
  } catch (err) {
    error.value = 'Erreur lors de la recherche';
    console.error(err);
    places.value = [];
  } finally {
    loading.value = false;
  }
};

const handleNearbySearch = async (): Promise<void> => {
  if (!coordQuery.value.trim()) {
    error.value = 'Veuillez entrer des coordonnées (format: lon;lat)';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const data = await getPlacesNearby(coordQuery.value);
    places.value = data.stop_areas || [];
  } catch (err) {
    error.value = 'Erreur lors de la recherche';
    console.error(err);
    places.value = [];
  } finally {
    loading.value = false;
  }
};
</script>
