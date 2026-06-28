<template>
  <button
    v-if="hasValidClientId"
    class="button is-info is-rounded"
    @click="handleLogin"
  >
    <span class="icon">
      <LogIn />
    </span>
    <span>Sign in with Google</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useGoogleAuth } from '@/composables/useGoogleAuth';

const { handleGoogleLogin } = useGoogleAuth();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasValidClientId = computed(() => googleClientId && googleClientId.trim() !== '');

const handleLogin = () => {
  handleGoogleLogin();
};
</script>

