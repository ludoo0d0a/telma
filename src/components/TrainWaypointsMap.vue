<template>
  <div v-if="positions.length > 0" style="height: 380px; width: 100%; border-radius: 6px; overflow: hidden">
    <div ref="mapContainer" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Waypoint {
  lat: number;
  lon: number;
  name?: string;
  isStart?: boolean;
  isEnd?: boolean;
}

interface Props {
  waypoints?: Waypoint[];
}

const props = defineProps<Props>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<maplibregl.Map | null>(null);
const selectedMarker = ref<number | null>(null);

const positions = computed<[number, number][]>(() => {
  return (props.waypoints || []).map((w) => [w.lat, w.lon]);
});

const bounds = computed<[[number, number], [number, number]] | null>(() => {
  if (positions.value.length < 2) return null;
  const lats = positions.value.map(p => p[0]);
  const lons = positions.value.map(p => p[1]);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)]
  ];
});

const center = computed<[number, number]>(() => {
  return positions.value[0] || [48.8566, 2.3522];
});

const zoom = computed<number>(() => {
  return positions.value.length <= 1 ? 12 : 8;
});

const polylineGeoJSON = computed(() => {
  if (positions.value.length < 2) return null;
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: positions.value.map(p => [p[1], p[0]])
    },
    properties: {}
  };
});

onMounted(() => {
  if (!mapContainer.value) return;

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [{
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }]
    },
    center: [center.value[1], center.value[0]],
    zoom: zoom.value,
    attributionControl: true
  });

  map.value.on('load', () => {
    if (polylineGeoJSON.value) {
      addRoute();
    }
    addWaypoints();
    fitBoundsIfNeeded();
  });
});

watch(() => props.waypoints, () => {
  if (map.value && map.value.isStyleLoaded()) {
    removeRoute();
    removeWaypoints();
    if (polylineGeoJSON.value) {
      addRoute();
    }
    addWaypoints();
    fitBoundsIfNeeded();
  }
}, { deep: true });

const addRoute = () => {
  if (!map.value || !polylineGeoJSON.value) return;

  map.value.addSource('route', {
    type: 'geojson',
    data: polylineGeoJSON.value
  });

  map.value.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#3273dc',
      'line-width': 4,
      'line-opacity': 0.85
    }
  });
};

const removeRoute = () => {
  if (!map.value) return;
  if (map.value.getLayer('route-line')) map.value.removeLayer('route-line');
  if (map.value.getSource('route')) map.value.removeSource('route');
};

const addWaypoints = () => {
  if (!map.value || !props.waypoints) return;
  
  props.waypoints.forEach((w, idx) => {
    const el = document.createElement('div');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3273dc';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2c-4 0-8 .5-8 4v9.5c0 .95.38 1.81 1 2.44L3 22h3l.5-2h11l.5 2h3l-2-4.06c.62-.63 1-1.49 1-2.44V6c0-3.5-3.58-4-8-4zM5.5 16c-.83 0-1.5-.67-1.5-1.5S4.67 13 5.5 13s1.5.67 1.5 1.5S6.33 16 5.5 16zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-5H4V6h16v5z"/></svg>';
    
    el.addEventListener('click', () => {
      selectedMarker.value = idx;
    });

    new maplibregl.Marker({ element: el })
      .setLngLat([w.lon, w.lat])
      .addTo(map.value!);
  });
};

const removeWaypoints = () => {
  // Markers are removed when map is recreated
};

const fitBoundsIfNeeded = () => {
  if (!bounds.value || !map.value || positions.value.length < 2) return;
  
  setTimeout(() => {
    try {
      map.value?.fitBounds(bounds.value!, {
        padding: { top: 24, bottom: 24, left: 24, right: 24 },
        duration: 500
      });
    } catch (err) {
      // Ignore fitBounds errors
    }
  }, 100);
};

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

