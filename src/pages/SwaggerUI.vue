<template>
  <div>
    <div class="swagger-page">
      <PageHeader
        title="API Documentation"
        subtitle="Swagger UI pour explorer l'API Telma"
        :show-notification="false"
      />
      <div class="swagger-page__content">
        <div id="swagger-ui"></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Footer from '@/components/Footer.vue';
import { PageHeader } from '@/components/skytrip';

let swaggerUIInstance: any = null;

onMounted(async () => {
  try {
    // Dynamic import of swagger-ui-vue
    const SwaggerUI = (await import('swagger-ui-vue')).default;
    const SwaggerUICss = await import('swagger-ui-vue/dist/swagger-ui.css');
    
    // Initialize Swagger UI
    const SwaggerUIBundle = (await import('swagger-ui-vue')).SwaggerUIBundle;
    
    swaggerUIInstance = SwaggerUIBundle({
      url: `${import.meta.env.BASE_URL || ''}/openapi.json`,
      dom_id: '#swagger-ui',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      persistAuthorization: true,
      requestInterceptor: (request: { headers?: Record<string, string> }) => {
        // Add API key to all requests
        if (import.meta.env.VITE_API_KEY) {
          if (!request.headers) {
            request.headers = {};
          }
          request.headers['Authorization'] = import.meta.env.VITE_API_KEY;
        }
        return request;
      }
    });
  } catch (error) {
    console.error('Failed to load Swagger UI:', error);
  }
});

onUnmounted(() => {
  if (swaggerUIInstance) {
    // Cleanup if needed
  }
});
</script>

<style>
@import 'swagger-ui-vue/dist/swagger-ui.css';
</style>
