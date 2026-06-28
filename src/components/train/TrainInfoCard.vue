<template>
  <div class="box has-background-light mb-5">
    <div class="columns is-vcentered">
      <div class="column is-narrow">
        <span :class="['icon', 'is-large', transportInfo.color]">
          <component :is="transportInfo.icon" :size="48" />
        </span>
      </div>
      <div class="column">
        <h2 class="title is-3 mb-2">{{ trainNumber }}</h2>
        <div class="tags">
          <span :class="['tag', transportInfo.tagColor, 'is-medium']">
            {{ transportInfo.label }}
          </span>
          <span v-if="network && network !== commercialMode" class="tag is-dark is-medium">
            {{ network }}
          </span>
        </div>
        <p v-if="direction" class="mt-2">
          <strong>Direction:</strong> {{ direction }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getTransportIcon } from '@/services/transportService';

interface Props {
  trainNumber: string;
  commercialMode: string;
  network: string;
  direction: string;
}

const props = defineProps<Props>();

const transportInfo = computed(() => getTransportIcon(props.commercialMode, props.network));
</script>

