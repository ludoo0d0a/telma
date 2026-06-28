<template>
  <button v-if="hasValidClientId" class="button is-info is-rounded" @click="handleLogin">
    <span class="icon">
      <LogIn />
    </span>
    <span>Sign in with Google</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';

const { login } = useAuth();
const googleClientId = computed(() => import.meta.env.VITE_GOOGLE_CLIENT_ID);
const hasValidClientId = computed(() => googleClientId.value && googleClientId.value.trim() !== '');

const handleLogin = () => {
  // TODO: Implement Google OAuth with vue3-google-oauth2 or direct OAuth flow
  // For now, this is a placeholder
  console.log('Login clicked - OAuth integration needed');
  // Example with vue3-google-oauth2:
  // const { signIn } = useGoogleAuth();
  // signIn().then((tokenResponse) => {
  //   login(tokenResponse);
  // });
};
</script>

