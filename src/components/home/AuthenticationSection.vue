<template>
  <div class="mb-6">
    <h2 class="title is-3 mb-4">
      <span class="icon mr-2">
        <LogIn :size="24" />
      </span>
      Authentification
    </h2>
    <div class="columns is-centered">
      <div class="column is-half has-text-centered">
        <p class="mb-4">Connectez-vous pour accéder à des fonctionnalités supplémentaires.</p>
        <Avatar v-if="user.value" />
        <LoginButton v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LogIn } from 'lucide-vue-next';
import LoginButton from '@/components/LoginButton.vue';
import Avatar from '@/components/Avatar.vue';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
</script>

