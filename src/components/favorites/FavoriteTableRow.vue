<template>
  <tr>
    <td>
      <strong>{{ favorite.name }}</strong>
    </td>
    <td>
      <span class="tag is-dark">
        {{ favorite.type === 'stop_area' ? 'Gare' : 'Point d\'arrêt' }}
      </span>
    </td>
    <td>
      <span class="has-text-grey">{{ formatDate(favorite.addedAt) }}</span>
    </td>
    <td>
      <button
        class="button is-small is-danger is-light"
        @click="$emit('remove-favorite', favorite.id)"
        title="Retirer des favoris"
      >
        <span class="icon">
          <Trash2 :size="16" />
        </span>
        <span>Retirer</span>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import type { FavoriteLocation } from '@/services/favoritesService';

interface Props {
  favorite: FavoriteLocation;
}

defineProps<Props>();

defineEmits<{
  'remove-favorite': [id: string];
}>();

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Date inconnue';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

