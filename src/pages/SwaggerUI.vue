<template>
  <div class="swagger-page">
    <PageHeader
      title="API Documentation"
      subtitle="Swagger UI pour explorer l'API Telma"
      :show-notification="false"
    />
    <div class="swagger-page__content" ref="swaggerContainer"></div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import PageHeader from '@/components/skytrip/PageHeader.vue';
import Footer from '@/components/Footer.vue';

const swaggerContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (swaggerContainer.value) {
    SwaggerUI({
      url: `${import.meta.env.BASE_URL || ''}/openapi.json`,
      dom_id: swaggerContainer.value,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      persistAuthorization: true,
      requestInterceptor: (request: any) => {
        if (import.meta.env.VITE_API_KEY) {
          if (!request.headers) {
            request.headers = {};
          }
          request.headers['Authorization'] = import.meta.env.VITE_API_KEY;
        }
        return request;
      },
    });
  }
});
</script>

<style>
.swagger-page__content {
  padding: 20px;
}
</style>

