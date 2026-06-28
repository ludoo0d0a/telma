<template>
  <div>
    <PageHeader
      title="À propos"
      subtitle="SNCF API Explorer - horaires, trajets et outils open data"
      :show-notification="false"
    />
    <section class="section about-page">
      <div class="container">
        <div class="box mb-5">
          <h2 class="title is-3 mb-4">
            <span class="icon has-text-primary mr-2">
              <Tag :size="24" />
            </span>
            Version & Author
          </h2>
          <div class="content">
            <div class="columns">
              <div class="column is-half">
                <p>
                  <strong>Version:</strong>
                  <span class="tag is-primary is-medium">{{ version }}</span>
                </p>
                <p class="mt-3">
                  <strong>Author:</strong>
                  <span>{{ author }}</span>
                  <a
                    href="https://github.com/ludooo0d0a"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="has-text-primary"
                  >
                    (@ludooo0d0a)
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import packageJson from '../../package.json';
import { Tag } from 'lucide-vue-next';
import PageHeader from '@/components/skytrip/PageHeader.vue';
import Footer from '@/components/Footer.vue';

const version = packageJson.version;
const author = packageJson.author;
</script>

