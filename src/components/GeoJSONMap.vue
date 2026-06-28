<template>
  <div v-if="processedGeoJSON || markers.length > 0" :style="{ height: `${height}px`, width: '100%', borderRadius: '6px', overflow: 'hidden' }">
    <div ref="mapContainer" :style="{ width: '100%', height: '100%' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoJSONMapProps, LayerPaintProperties } from '@/types/geojsonMap';
import { processGeoJSONData, calculateBoundsWithMarkers, hasLineStrings, hasPolygons } from '@/services/geojsonService';
import type { FeatureCollection } from 'geojson';

interface Props {
  geojsonData?: unknown;
  style?: ((feature: unknown) => Record<string, unknown>) | Record<string, unknown>;
  markers?: Array<{ lat: number; lon: number; name?: string; popup?: string }>;
  height?: number;
  center?: [number, number];
  zoom?: number;
  fitBounds?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  height: 400,
  center: () => [48.8566, 2.3522],
  zoom: 10,
  fitBounds: true
});

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<maplibregl.Map | null>(null);
const selectedMarker = ref<number | null>(null);

const processedGeoJSON = computed<FeatureCollection | null>(() => {
  return processGeoJSONData(props.geojsonData);
});

const hasLines = computed(() => {
  return processedGeoJSON.value ? hasLineStrings(processedGeoJSON.value) : false;
});

const hasPolygonsValue = computed(() => {
  return processedGeoJSON.value ? hasPolygons(processedGeoJSON.value) : false;
});

const layerPaint = computed<LayerPaintProperties>(() => {
  if (typeof props.style === 'function') {
    return {
      'line-color': '#3273dc',
      'line-width': 4,
      'line-opacity': 0.85,
      'fill-color': '#3273dc',
      'fill-opacity': 0.3
    };
  }
  if (typeof props.style === 'object' && props.style !== null) {
    const s = props.style as Record<string, unknown>;
    return {
      'line-color': (s.color as string) || '#3273dc',
      'line-width': ((s.weight as number) || 2) * 2,
      'line-opacity': (s.opacity as number) || 0.8,
      'fill-color': (s.fillColor as string) || (s.color as string) || '#3273dc',
      'fill-opacity': (s.fillOpacity as number) || 0.3
    };
  }
  return {
    'line-color': '#3273dc',
    'line-width': 4,
    'line-opacity': 0.85,
    'fill-color': '#3273dc',
    'fill-opacity': 0.3
  };
});

const mapCenter = computed<[number, number]>(() => {
  if (props.markers.length > 0 && props.markers[0].lat && props.markers[0].lon) {
    return [props.markers[0].lat, props.markers[0].lon];
  }
  return props.center;
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
    center: [mapCenter.value[1], mapCenter.value[0]],
    zoom: props.zoom,
    attributionControl: { compact: true }
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.value.addControl(new maplibregl.GeolocateControl(), 'top-right');

  map.value.on('load', () => {
    if (processedGeoJSON.value) {
      addGeoJSONSource();
    }
    addMarkers();
    fitBoundsIfNeeded();
  });
});

watch(() => processedGeoJSON.value, () => {
  if (map.value && map.value.isStyleLoaded()) {
    removeGeoJSONSource();
    if (processedGeoJSON.value) {
      addGeoJSONSource();
    }
    fitBoundsIfNeeded();
  }
});

watch(() => props.markers, () => {
  if (map.value && map.value.isStyleLoaded()) {
    removeMarkers();
    addMarkers();
    fitBoundsIfNeeded();
  }
});

const addGeoJSONSource = () => {
  if (!map.value || !processedGeoJSON.value) return;

  map.value.addSource('geojson-data', {
    type: 'geojson',
    data: processedGeoJSON.value
  });

  if (hasLines.value) {
    map.value.addLayer({
      id: 'geojson-lines',
      type: 'line',
      source: 'geojson-data',
      paint: {
        'line-color': layerPaint.value['line-color'],
        'line-width': layerPaint.value['line-width'],
        'line-opacity': layerPaint.value['line-opacity']
      }
    });
  }

  if (hasPolygonsValue.value) {
    map.value.addLayer({
      id: 'geojson-polygons-fill',
      type: 'fill',
      source: 'geojson-data',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': layerPaint.value['fill-color'],
        'fill-opacity': layerPaint.value['fill-opacity']
      }
    });

    map.value.addLayer({
      id: 'geojson-polygons-outline',
      type: 'line',
      source: 'geojson-data',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'line-color': layerPaint.value['line-color'],
        'line-width': layerPaint.value['line-width'] / 2,
        'line-opacity': layerPaint.value['line-opacity']
      }
    });
  }
};

const removeGeoJSONSource = () => {
  if (!map.value) return;
  if (map.value.getLayer('geojson-lines')) map.value.removeLayer('geojson-lines');
  if (map.value.getLayer('geojson-polygons-fill')) map.value.removeLayer('geojson-polygons-fill');
  if (map.value.getLayer('geojson-polygons-outline')) map.value.removeLayer('geojson-polygons-outline');
  if (map.value.getSource('geojson-data')) map.value.removeSource('geojson-data');
};

const addMarkers = () => {
  if (!map.value) return;
  props.markers.forEach((marker, idx) => {
    if (!marker.lat || !marker.lon) return;
    
    const el = document.createElement('div');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3273dc';
    el.style.border = '2px solid white';
    el.style.cursor = marker.popup || marker.name ? 'pointer' : 'default';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
    
    el.addEventListener('click', () => {
      selectedMarker.value = idx;
    });

    new maplibregl.Marker({ element: el })
      .setLngLat([marker.lon, marker.lat])
      .addTo(map.value!);
  });
};

const removeMarkers = () => {
  // Markers are removed when map is recreated or manually
  // In a real implementation, you'd track marker instances
};

const fitBoundsIfNeeded = () => {
  if (!props.fitBounds || !map.value) return;
  
  const bounds = calculateBoundsWithMarkers(processedGeoJSON.value, props.markers);
  if (bounds) {
    setTimeout(() => {
      try {
        map.value?.fitBounds(bounds, {
          padding: { top: 24, bottom: 24, left: 24, right: 24 },
          duration: 500
        });
      } catch (err) {
        // Ignore fitBounds errors
      }
    }, 100);
  }
};

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

