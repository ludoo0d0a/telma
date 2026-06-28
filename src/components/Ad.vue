<template>
  <div v-if="showAds" :class="['ad-container', className]" :style="style">
    <div v-if="!publisherId || publisherId.trim() === ''" class="ad-placeholder">
      <div class="ad-placeholder-content">
        <p class="has-text-grey is-size-7">
          <Info :size="16" class="mr-2" />
          Ad space - Configure VITE_GOOGLE_ADSENSE_ID in .env file
        </p>
      </div>
    </div>
    <ins
      v-else
      class="adsbygoogle"
      :style="{ display: 'block', ...style }"
      :data-ad-client="publisherId"
      :data-ad-slot="adSlot"
      :data-ad-format="format === 'auto' ? 'auto' : undefined"
      :data-full-width-responsive="size === 'responsive' ? 'true' : 'false'"
      :data-adtest="enableTestMode ? 'on' : undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from 'lucide-vue-next';

interface AdProps {
  adSlot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | string;
  size?: 'responsive' | string;
  className?: string;
  style?: Record<string, string | number>;
}

const props = withDefaults(defineProps<AdProps>(), {
  format: 'auto',
  size: 'responsive',
  className: '',
  style: () => ({})
});

const showAds = computed(() => import.meta.env.VITE_SHOW_ADS !== 'false');
const publisherId = computed(() => import.meta.env.VITE_GOOGLE_ADSENSE_ID);

const isLocalhost = computed(() => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' ||
         hostname.startsWith('192.168.');
});

const enableTestMode = computed(() => isLocalhost.value);
</script>

