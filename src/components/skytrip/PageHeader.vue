<template>
  <header class="skytrip-page-header">
    <div class="header-top">
      <div class="left-actions">
        <button
          v-if="resolvedLeftAction === 'back'"
          @click="handleBack"
          class="icon-button back-button"
        >
          <ArrowLeft :size="20" :stroke-width="2" />
        </button>
        <button
          v-else
          @click="handleMenu"
          class="icon-button menu-button"
        >
          <Menu :size="20" :stroke-width="2" />
        </button>
      </div>

      <div class="title-block">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>

      <div class="right-actions">
        <button
          v-if="showSearch"
          class="icon-button search-button"
          @click="onSearch"
        >
          <Search :size="20" :stroke-width="2" />
        </button>
        <button
          v-if="showNotification"
          :class="['icon-button', 'notification', { 'is-pending': hasPendingNotifications }]"
          @click="onNotificationClick"
        >
          <Bell :size="20" />
        </button>
        <div v-if="showAvatar" class="avatar-wrapper">
          <Avatar
            variant="compact"
            :fallback-picture="avatarUrl"
            :fallback-name="title"
          />
        </div>
      </div>
    </div>
    <slot />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Menu, Search, Bell } from 'lucide-vue-next';
import { useSidebar } from '@/composables/useSidebar';
import Avatar from '@/components/Avatar.vue';
import './PageHeader.scss';

interface Props {
  title: string;
  subtitle?: string;
  leftAction?: 'menu' | 'back';
  showBack?: boolean;
  backUrl?: string;
  onBack?: () => void;
  onMenu?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showMenu?: boolean;
  showAvatar?: boolean;
  showNotification?: boolean;
  hasPendingNotifications?: boolean;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  onNotificationClick?: () => void;
  variant?: 'default' | 'with-route';
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  showSearch: false,
  showAvatar: true,
  showNotification: true,
  hasPendingNotifications: false,
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
});

const router = useRouter();
const { toggleSidebar } = useSidebar();

const resolvedLeftAction = computed(() => props.leftAction ?? (props.showBack ? 'back' : 'menu'));

const handleBack = () => {
  if (props.onBack) {
    props.onBack();
  } else if (props.backUrl) {
    router.push(props.backUrl);
  } else {
    router.back();
  }
};

const handleMenu = () => {
  if (props.onMenu) {
    props.onMenu();
    return;
  }
  toggleSidebar();
};
</script>

