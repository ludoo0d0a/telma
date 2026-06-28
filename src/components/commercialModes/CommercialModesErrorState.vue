<template>
  <div class="notification is-danger">
    <button class="delete" @click="$emit('dismiss')"></button>
    <p class="title is-5">Erreur</p>
    <p>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: string;
}

defineProps<Props>();

defineEmits<{
  dismiss: [];
}>();
</script>

