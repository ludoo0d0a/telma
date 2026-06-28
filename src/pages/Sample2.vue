<template>
  <div class="app-flight">
    <PageHeader
      title="Saved Flights"
      subtitle="Retrouvez vos vols enregistrés"
      back-url="/"
      :show-search="true"
    />
    <main>
      <div class="skytrip-flight-card">
        <Tabs
          :tabs="tabs"
          :active-tab="activeTab"
          @tab-change="activeTab = $event"
          variant="rounded"
        />
      </div>
      <div class="saved-flights">
        <FlightCard
          v-for="(flight, index) in flights"
          :key="index"
          :from="flight.from"
          :to="flight.to"
          :departure-time="flight.departureTime"
          :arrival-time="flight.arrivalTime"
          :duration="flight.duration"
          :airline="flight.airline"
          variant="saved"
          :show-timeline="false"
          :header="flight.header"
          :footer="flight.footer"
          :flight-type="flight.flightType"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { PageHeader, Tabs, FlightCard } from '@/components/skytrip';
import { PlaneTakeoff, Bookmark } from 'lucide-vue-next';

const activeTab = ref('active');

const tabs = [
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' }
];

const flights = [
  {
    from: { code: 'JFK', city: 'New York' },
    to: { code: 'HKG', city: 'HKG' },
    departureTime: '09:30',
    arrivalTime: '21:45',
    duration: '12h 15m',
    airline: 'Cathay Pacific',
    flightType: 'Direct',
    header: h('div', { class: 'flight-header' }, [
      h('div', { class: 'airline' }, [
        h(PlaneTakeoff, { size: 20 }),
        h('span', 'Cathay Pacific')
      ]),
      h(Bookmark, { size: 20 })
    ]),
    footer: h('div', { class: 'flight-footer' }, [
      h('span', { class: 'date' }, 'Mon, Dec 18 2023'),
      h('button', { class: 'status-button' }, 'Active')
    ])
  }
];
</script>

