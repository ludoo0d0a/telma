<template>
  <div>
    <div class="swagger-page">
      <PageHeader
        title="API Documentation"
        subtitle="Swagger UI pour explorer l'API Telma"
        :show-notification="false"
      />
      <div class="swagger-page__content">
        <SwaggerUI
          :url="swaggerUrl"
          :doc-expansion="'list'"
          :default-models-expand-depth="1"
          :default-model-expand-depth="1"
          :persist-authorization="true"
          :request-interceptor="requestInterceptor"
        />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SwaggerUI from 'swagger-ui-vue';
import 'swagger-ui-vue/swagger-ui.css';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';

const swaggerUrl = computed(() => `${import.meta.env.BASE_URL || ''}/openapi.json`);

const requestInterceptor = (request: { headers?: Record<string, string> }) => {
  if (import.meta.env.VITE_API_KEY) {
    if (!request.headers) {
      request.headers = {};
    }
    request.headers['Authorization'] = import.meta.env.VITE_API_KEY;
  }
  return request;
};
</script>

