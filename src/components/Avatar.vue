<template>
  <div v-if="displayUser" ref="dropdownRef" class="avatar-menu">
    <button
      type="button"
      :class="['avatar-trigger', { 'is-open': isOpen, 'is-compact': variant === 'compact' }]"
      @click="isOpen = !isOpen"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
    >
      <img :src="displayUser.picture" alt="User avatar" class="avatar-image" />
      <div v-if="variant === 'default'" class="avatar-text">
        <span class="avatar-name">{{ displayUser.name }}</span>
        <span v-if="displayUser.email" class="avatar-email">{{ displayUser.email }}</span>
      </div>
      <ChevronDown :size="16" class="avatar-caret" />
    </button>

    <div v-if="isOpen" class="avatar-dropdown" role="menu">
      <button
        v-if="!user.value && hasValidClientId"
        type="button"
        class="avatar-menu-item"
        @click="handleLogin()"
      >
        <LogIn :size="18" />
        <span>Sign in with Google</span>
      </button>
      <button
        type="button"
        class="avatar-menu-item"
        @click="handleNavigate('/dashboard')"
      >
        <Settings :size="18" />
        <span>Settings</span>
      </button>
      <button
        type="button"
        class="avatar-menu-item"
        @click="handleNavigate('/favorites')"
      >
        <Star :size="18" />
        <span>Favorites</span>
      </button>
      <button
        v-if="user.value"
        type="button"
        class="avatar-menu-item is-danger"
        @click="handleLogout"
      >
        <LogOut :size="18" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, LogIn, LogOut, Settings, Star } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useGoogleLogin } from '@/utils/googleOAuth';

type AvatarVariant = 'default' | 'compact';

interface Props {
  variant?: AvatarVariant;
  fallbackPicture?: string;
  fallbackName?: string;
  fallbackEmail?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
});

const { user, login, logout } = useAuth();
const router = useRouter();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasValidClientId = computed(() => Boolean(googleClientId && googleClientId.trim()));
const hasFallback = computed(() => Boolean(props.fallbackPicture || props.fallbackName || props.fallbackEmail));

const displayUser = computed(() => {
  const currentUser = user.value;
  if (currentUser) return currentUser;
  if (hasFallback.value) {
    return {
      picture: props.fallbackPicture ?? 'https://i.pravatar.cc/150?u=telma-guest',
      name: props.fallbackName ?? 'Guest',
      email: props.fallbackEmail
    };
  }
  return null;
});

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
});

const handleNavigate = (path: string) => {
  router.push(path);
  isOpen.value = false;
};

const handleLoginClick = useGoogleLogin({
  onSuccess: (tokenResponse) => {
    login(tokenResponse.access_token);
    isOpen.value = false;
  },
  onError: () => {
    console.log('Login Failed');
  },
  scope: 'https://www.googleapis.com/auth/drive.appdata'
});

const handleLogin = () => {
  handleLoginClick();
};

const handleLogout = () => {
  logout();
  isOpen.value = false;
};
</script>

