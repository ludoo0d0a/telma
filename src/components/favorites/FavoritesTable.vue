<template>
  <div class="box">
    <h2 class="title is-4 mb-5">
      Mes gares favorites <span class="tag is-primary is-medium">{{ favorites.length }}</span>
    </h2>
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Ajouté le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <FavoriteTableRow
            v-for="favorite in favorites"
            :key="favorite.id"
            :favorite="favorite"
            @remove-favorite="$emit('remove-favorite', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FavoriteLocation } from '@/services/favoritesService';
import FavoriteTableRow from './FavoriteTableRow.vue';

interface Props {
  favorites: FavoriteLocation[];
}

defineProps<Props>();

defineEmits<{
  'remove-favorite': [id: string];
}>();
</script>

