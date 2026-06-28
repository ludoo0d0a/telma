<template>
  <div>
    <PageHeader
      title="Modes de transport SNCF"
      subtitle="Découvrez les modes commerciaux disponibles dans l'API"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <CommercialModesLoadingState v-if="loading" />
        <CommercialModesErrorState
          v-if="error"
          :error="error"
          @dismiss="error = null"
        />
        <CommercialModesList v-if="!loading && !error" :modes="modes" />
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getCommercialModes } from '@/services/navitiaApi';
import type { CommercialMode } from '@/client/models/commercial-mode';
import CommercialModesLoadingState from '@/components/commercialModes/CommercialModesLoadingState.vue';
import CommercialModesErrorState from '@/components/commercialModes/CommercialModesErrorState.vue';
import CommercialModesList from '@/components/commercialModes/CommercialModesList.vue';

const modes = ref<CommercialMode[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    const data = await getCommercialModes();
    modes.value = data.commercial_modes || [];
    error.value = null;
  } catch (err) {
    error.value = 'Erreur lors du chargement des modes de transport';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
