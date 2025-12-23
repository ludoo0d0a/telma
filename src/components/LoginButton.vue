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
import { useAuth } from '@/composables/useAuth';
import { useGoogleLogin } from '@/utils/googleOAuth';

const { login } = useAuth();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasValidClientId = computed(() => googleClientId && googleClientId.trim() !== '');

const handleLoginClick = useGoogleLogin({
  onSuccess: (tokenResponse) => {
    login(tokenResponse.access_token);
  },
  onError: () => {
    console.log('Login Failed');
  },
  scope: 'https://www.googleapis.com/auth/drive.appdata'
});

const handleLogin = () => {
  handleLoginClick();
};
</script>

