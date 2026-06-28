<template>
  <div>
    <PageHeader
      title="Zones de couverture"
      subtitle="Consultez les régions et réseaux disponibles"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div v-if="loading && !selectedCoverage" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des zones de couverture...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <template v-if="!loading && !selectedCoverage">
          <CoverageContext v-if="coverageResponse?.context" :context="coverageResponse.context" />
          <CoverageList
            :coverages="coverages"
            :coverage-response="coverageResponse"
            @coverage-click="handleCoverageClick"
          />
        </template>

        <CoverageDetail
          v-if="selectedCoverage"
          :selected-coverage="selectedCoverage"
          @back="selectedCoverage = null"
        />
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getCoverage, getCoverageDetails } from '@/services/navitiaApi';
import type { CoverageResponse, Coverage } from '@/client/models';
import type { Link } from '@/client/models/link';
import type { Context } from '@/client/models/context';
import { CoverageContext, CoverageList, CoverageDetail } from '@/components/coverage';

interface SelectedCoverage extends Coverage {
  id: string;
  context?: Context;
  links?: Link[];
}

const coverages = ref<Coverage[]>([]);
const coverageResponse = ref<CoverageResponse | null>(null);
const selectedCoverage = ref<SelectedCoverage | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    const data = await getCoverage();
    coverages.value = data.regions || [];
    coverageResponse.value = data;
    error.value = null;
  } catch (err) {
    error.value = 'Erreur lors du chargement des zones de couverture';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const handleCoverageClick = async (coverageId: string | undefined): Promise<void> => {
  if (!coverageId) return;
  
  try {
    loading.value = true;
    const data = await getCoverageDetails(coverageId);
    selectedCoverage.value = { id: coverageId, ...data } as SelectedCoverage;
    error.value = null;
  } catch (err) {
    error.value = 'Erreur lors du chargement des détails';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
