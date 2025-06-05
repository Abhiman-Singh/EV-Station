<template>
  <div class="map-container">
    <l-map
      ref="leafletMap"
      :zoom="zoom"
      :center="center"
      :max-bounds="maxBounds"
      :min-zoom="minZoom"
      :options="mapOptions"
      @click="handleMapClick"
      @ready="onMapReady"
      class="leaflet-map"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      
      <l-marker
        v-for="charger in chargers"
        :key="charger._id || charger.id" :lat-lng="[charger.location.latitude, charger.location.longitude]"
        @click="openPopup(charger)"
      >
        <l-icon :icon-url="markerIcon" :icon-size="[32, 32]" />
        <l-popup>
          <div class="charger-popup">
            <h4>{{ charger.name }}</h4>
            <p v-if="charger.addressDisplayName">
              <i class="fas fa-map-signs"></i> <strong>Address:</strong> {{ charger.addressDisplayName }}
            </p>
            <p v-else>
                <i class="fas fa-map-signs"></i> <strong>Address:</strong> N/A
            </p>
            <p><i class="fas fa-bolt"></i> <strong>Power:</strong> {{ charger.powerOutput }} kW</p>
            <p><i class="fas fa-plug"></i> <strong>Connector:</strong> {{ charger.connectorType }}</p>
            <p>
              <i class="fas fa-signal"></i>
              <strong>Status:</strong>
              <span :class="charger.status === 'Active' ? 'status-active' : 'status-inactive'">
                {{ charger.status }}
              </span>
            </p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>


<script>
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon path issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'MapView',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LIcon,
  },
  props: {
    chargers: {
      type: Array,
      required: true
    }
  },
  emits: ['map-clicked'],
  data() {
    return {
      zoom: 6, // Reduced from 10 to 6 for better overview
      center: [27.6083, 75.3934], // Default center (Jhunjhunu)
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      markerIcon: require('leaflet/dist/images/marker-icon.png'),
      minZoom: 2,
      maxBounds: null,
      mapOptions: {
        worldCopyJump: true,
        noWrap: false,
        continuousWorld: true,
        maxBoundsViscosity: 0.0
      },
      mapInstance: null
    };
  },
  mounted() {
    // Force map resize after component is mounted
    this.$nextTick(() => {
      this.invalidateMapSize();
    });
  },
  activated() {
    // Handle keep-alive component activation
    this.$nextTick(() => {
      this.invalidateMapSize();
    });
  },
  methods: {
    onMapReady(mapInstance) {
      this.mapInstance = mapInstance;
      // Force resize when map is ready
      setTimeout(() => {
        this.invalidateMapSize();
      }, 100);
    },
    
    invalidateMapSize() {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
      } else if (this.$refs.leafletMap && this.$refs.leafletMap.leafletObject) {
        this.$refs.leafletMap.leafletObject.invalidateSize();
      }
    },
    
    openPopup(charger) {
      console.log('Clicked on charger:', charger.name);
    },
    
    handleMapClick(event) {
      this.$emit('map-clicked', {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    },
    
    updateMapCenter() {
      if (this.chargers.length > 0) {
        const avgLat = this.chargers.reduce((sum, c) => sum + c.location.latitude, 0) / this.chargers.length;
        const avgLon = this.chargers.reduce((sum, c) => sum + c.location.longitude, 0) / this.chargers.length;
        this.center = [avgLat, avgLon];
         
        if (this.chargers.length === 1) {
          this.zoom = 12; // Reduced from 15 to 12 for single charger
        } else {
          this.zoom = 8; // Reduced from 12 to 8 for multiple chargers
        }
      }
      
      // Invalidate size after center update
      this.$nextTick(() => {
        this.invalidateMapSize();
      });
    }
  },
  watch: {
    chargers: {
      immediate: true,
      handler() {
        this.updateMapCenter();
      }
    }
  }
};
</script>

<style scoped>
.map-container {
  height: 600px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: box-shadow 0.3s ease-in-out;
}

.map-container:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.leaflet-map {
  height: 100%;
  width: 100%;
  border-radius: 12px;
}

/* Charger popup styling */
.charger-popup {
  background: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.95em;
  min-width: 200px;
}

.charger-popup h4 {
  margin-top: 0;
  color: #007bff;
  font-size: 1.1em;
  margin-bottom: 8px;
  font-weight: 600;
}

.charger-popup p {
  margin: 4px 0;
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-active {
  color: #28a745;
  font-weight: bold;
}

.status-inactive {
  color: #dc3545;
  font-weight: bold;
}

/* Font Awesome icons */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
