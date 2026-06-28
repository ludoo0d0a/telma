<template>
  <template v-if="isOpen">
    <div class="sidebar-backdrop" @click="$emit('close')"></div>
  </template>
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
          <router-link to="/" class="sidebar-link" exact-active-class="active" @click="$emit('close')">
            <span class="icon"><Home :size="20" /></span>
            <span>Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/itinerary" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Route :size="20" /></span>
            <span>Trajet</span>
          </router-link>
        </li>
        <li>
          <router-link to="/schedules" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Clock :size="20" /></span>
            <span>Horaires</span>
          </router-link>
        </li>
        <li>
          <router-link to="/places" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><MapPin :size="20" /></span>
            <span>Lieux</span>
          </router-link>
        </li>
        <li>
          <router-link to="/location-detection" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Crosshair :size="20" /></span>
            <span>Détection de localisation</span>
          </router-link>
        </li>
        <li>
          <router-link to="/favorites" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Star :size="20" /></span>
            <span>Favoris</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><LayoutDashboard :size="20" /></span>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/stats" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><BarChart2 :size="20" /></span>
            <span>Stats</span>
          </router-link>
        </li>
        <li>
          <router-link to="/raise-issue" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><MessageSquareWarning :size="20" /></span>
            <span>Raise an issue</span>
          </router-link>
        </li>
        <li>
          <router-link to="/train" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Train :size="20" /></span>
            <span>Train</span>
          </router-link>
        </li>
        <li>
          <router-link to="/lines" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Route :size="20" /></span>
            <span>Lignes</span>
          </router-link>
        </li>
        <li>
          <router-link to="/reports" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><BarChart3 :size="20" /></span>
            <span>Rapports</span>
          </router-link>
        </li>
        <li>
          <router-link to="/coverage" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Map :size="20" /></span>
            <span>Couverture</span>
          </router-link>
        </li>
        <li>
          <router-link to="/isochrones" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Circle :size="20" /></span>
            <span>Isochrones</span>
          </router-link>
        </li>
        <li>
          <router-link to="/commercial-modes" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Bus :size="20" /></span>
            <span>Modes Commerciaux</span>
          </router-link>
        </li>
        <li>
          <router-link to="/api-docs" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Book :size="20" /></span>
            <span>API Documentation</span>
          </router-link>
        </li>
        <li>
          <router-link to="/about" class="sidebar-link" active-class="active" @click="$emit('close')">
            <span class="icon"><Info :size="20" /></span>
            <span>About</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { X, Home, Route, Clock, MapPin, Crosshair, Star, Train, BarChart3, Map, Circle, Bus, Book, Info, LayoutDashboard, BarChart2, MessageSquareWarning } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

