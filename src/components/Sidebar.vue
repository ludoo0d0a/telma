<template>
  <div>
    <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
    <aside :class="['sidebar', { 'is-open': isOpen }]">
      <div class="sidebar-header">
        <h3>More</h3>
        <button class="button is-ghost" @click="$emit('close')">
          <span class="icon">
            <X :size="20" />
          </span>
        </button>
      </div>
      <div class="sidebar-content">
        <ul class="sidebar-links">
          <li>
            <RouterLink to="/" end class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Home :size="20" /></span>
              <span>Home</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/itinerary" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Route :size="20" /></span>
              <span>Trajet</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/schedules" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Clock :size="20" /></span>
              <span>Horaires</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/places" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><MapPin :size="20" /></span>
              <span>Lieux</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/location-detection" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Crosshair :size="20" /></span>
              <span>Détection de localisation</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/favorites" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Star :size="20" /></span>
              <span>Favoris</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/dashboard" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><LayoutDashboard :size="20" /></span>
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/stats" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><BarChart2 :size="20" /></span>
              <span>Stats</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/raise-issue" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><MessageSquareWarning :size="20" /></span>
              <span>Raise an issue</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/train" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Train :size="20" /></span>
              <span>Train</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/lines" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Route :size="20" /></span>
              <span>Lignes</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/reports" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><BarChart3 :size="20" /></span>
              <span>Rapports</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/coverage" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Map :size="20" /></span>
              <span>Couverture</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/isochrones" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Circle :size="20" /></span>
              <span>Isochrones</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/commercial-modes" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Bus :size="20" /></span>
              <span>Modes Commerciaux</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/api-docs" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Book :size="20" /></span>
              <span>API Documentation</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" class="sidebar-link" @click="$emit('close')">
              <span class="icon"><Info :size="20" /></span>
              <span>About</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  X,
  Home,
  Route,
  Clock,
  MapPin,
  Crosshair,
  Star,
  Train,
  BarChart3,
  Map,
  Circle,
  Bus,
  Book,
  Info,
  LayoutDashboard,
  BarChart2,
  MessageSquareWarning
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

