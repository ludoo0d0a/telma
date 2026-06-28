<template>
  <button v-if="hasValidClientId" class="button is-info is-rounded" @click="handleLogin">
    <span class="icon">
      <LogIn />
    </span>
    <span>Sign in with Google</span>
  </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useGoogleLogin } from '@/composables/useGoogleLogin';

const { login } = useAuth();
const googleClientId = inject<string>('googleClientId', import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
const hasValidClientId = computed(() => googleClientId && googleClientId.trim() !== '');

const { signIn } = useGoogleLogin();

const handleLogin = () => {
  signIn(
    (tokenResponse) => {
      login(tokenResponse);
    },
    () => {
      console.log('Login Failed');
    }
  );
};
</script>

