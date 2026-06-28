<template>
  <div class="app-flight">
    <PageHeader
      title="Statistics"
      subtitle="Visualisez vos indicateurs clés"
      :show-notification="false"
    />

    <main>
      <div class="flight-results-section">
        <div class="container">
          <h2 class="title is-2">Statistics</h2>
          <div class="columns is-multiline">
            <div class="column is-one-third">
              <div class="box">
                <p class="title is-4">Total Journeys</p>
                <p class="subtitle is-6">1,234</p>
              </div>
            </div>
            <div class="column is-one-third">
              <div class="box">
                <p class="title is-4">Stations Covered</p>
                <p class="subtitle is-6">567</p>
              </div>
            </div>
            <div class="column is-one-third">
              <div class="box">
                <p class="title is-4">Active Users</p>
                <p class="subtitle is-6">890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/skytrip/PageHeader.vue';
</script>

