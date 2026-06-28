<template>
  <div>
    <div class="swagger-page">
      <PageHeader
        title="API Documentation"
        subtitle="Swagger UI pour explorer l'API Telma"
        :show-notification="false"
      />
      <div class="swagger-page__content">
        <div ref="swaggerContainer"></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageHeader from '@/components/skytrip/PageHeader.vue';
import Footer from '@/components/Footer.vue';

const swaggerContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  if (swaggerContainer.value && typeof window !== 'undefined') {
    // Dynamically import Swagger UI
    const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default;
    const SwaggerUIStandalonePreset = (await import('swagger-ui-dist/swagger-ui-standalone-preset.js')).default;
    
    SwaggerUIBundle({
      url: `${import.meta.env.BASE_URL || ''}/openapi.json`,
      dom_id: swaggerContainer.value,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: 'StandaloneLayout',
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

