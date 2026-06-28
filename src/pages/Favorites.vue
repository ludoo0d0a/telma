<template>
  <div>
    <PageHeader
      title="Vos favoris"
      subtitle="Retrouvez rapidement vos gares et lieux sauvegardés"
      :show-notification="false"
    />
    <section class="section">
      <div class="container">
        <div v-if="loading" class="has-text-centered">
          <Loader2 class="animate-spin" :size="48" />
          <p class="is-size-4 mt-4">Chargement des favoris...</p>
        </div>
        <FavoritesTable
          v-else-if="favorites.length > 0"
          :favorites="favorites"
          @remove-favorite="handleRemoveFavorite"
        />
        <div v-else class="message is-info">
          <div class="message-body">
            <p class="is-size-5">
              <MapPin class="icon" />
              Vous n'avez pas encore de favoris.
            </p>
            <p>
              Pour ajouter un favori, recherchez un lieu ou une gare et cliquez sur l'étoile.
            </p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Star, MapPin, Loader2 } from 'lucide-vue-next';
import { getFavorites, removeFavorite, type FavoriteLocation } from '@/services/favoritesService';
import FavoritesTable from '@/components/favorites/FavoritesTable.vue';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';

const favorites = ref<FavoriteLocation[]>([]);
const loading = ref<boolean>(true);

onMounted(async () => {
  loading.value = true;
  favorites.value = await getFavorites();
  loading.value = false;
});

const handleRemoveFavorite = async (id: string) => {
  await removeFavorite(id);
  favorites.value = await getFavorites();
};
</script>
