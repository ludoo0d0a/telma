<template>
  <div>
    <PageHeader
      title="Lignes de transport"
      subtitle="Consultez les lignes disponibles et leurs informations"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div v-if="loading && lines.length === 0" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4 subtitle is-5">Chargement des lignes...</p>
        </div>

        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = null"></button>
          <p class="title is-5">Erreur</p>
          <p>{{ error }}</p>
        </div>

        <div v-if="!loading && lines.length > 0" class="box">
          <h2 class="title is-4 mb-5">
            Lignes disponibles <span class="tag is-primary is-medium">{{ lines.length }}</span>
          </h2>
          <div class="columns is-multiline">
            <div
              v-for="line in lines"
              :key="line.id"
              class="column is-half-tablet is-one-third-desktop is-half-mobile"
            >
              <div class="box">
                <h3 class="title is-5 mb-3">
                  {{ line.name || line.code || 'Sans nom' }}
                </h3>
                <div class="content">
                  <p><strong>ID:</strong> <code>{{ line.id }}</code></p>
                  <p v-if="line.commercial_mode && typeof line.commercial_mode === 'object' && 'name' in line.commercial_mode">
                    <strong>Mode:</strong> {{ (line.commercial_mode as { name?: string }).name }}
                  </p>
                  <p v-if="line.network && typeof line.network === 'object' && 'name' in line.network">
                    <strong>Réseau:</strong> {{ (line.network as { name?: string }).name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMore && !loading" class="has-text-centered mt-5">
          <button
            class="button is-primary"
            @click="loadMore"
          >
            <span class="icon"><ArrowDown :size="20" /></span>
            <span>Charger plus</span>
          </button>
        </div>

        <div v-if="loading && lines.length > 0" class="box has-text-centered">
          <div class="loader-wrapper">
            <div class="loader is-loading"></div>
          </div>
          <p class="mt-4">Chargement...</p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ArrowDown } from 'lucide-vue-next';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';
import { getLines } from '@/services/navitiaApi';
import type { Line } from '@/client/models/line';

const lines = ref<Line[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const page = ref<number>(0);
const hasMore = ref<boolean>(true);

const fetchLines = async (): Promise<void> => {
  try {
    loading.value = true;
    const data = await getLines('sncf', { start_page: page.value, count: 25 });
    const newLines = data.lines || [];
    lines.value = page.value === 0 ? newLines : [...lines.value, ...newLines];
    hasMore.value = newLines.length === 25;
    error.value = null;
  } catch (err) {
    error.value = 'Erreur lors du chargement des lignes';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLines();
});

watch(page, () => {
  fetchLines();
});

const loadMore = () => {
  page.value += 1;
};
</script>
