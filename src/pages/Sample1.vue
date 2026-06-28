<template>
  <div class="app-flight">
    <PageHeader
      title="Good morning!"
      subtitle="Planifiez vos vols du jour"
      back-url="/"
      :show-notification="true"
      :has-pending-notifications="true"
    />

    <main>
      <SearchCard
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="activeTab = $event"
        @search="handleSearch"
      />

      <div class="flight-results-section">
        <FlightList
          :flights="flights"
          title="Results"
          :show-see-all="true"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchCard, FlightList, PageHeader } from '@/components/skytrip';

const activeTab = ref('one-way');

const tabs = [
  { label: 'One-Way', value: 'one-way' },
  { label: 'Round Trip', value: 'round-trip' },
  { label: 'Multi-City', value: 'multi-city' }
];

const flights = [
  {
    from: { code: 'DPS', city: 'Bali' },
    to: { code: 'CGK', city: 'Banten' },
    departureTime: '10:00 AM',
    arrivalTime: '11:45 AM',
    duration: '1h 45m',
    airline: 'Garuda Indonesia',
    price: '$140'
  }
];

const handleSearch = () => {
  console.log('Search clicked');
};
</script>

