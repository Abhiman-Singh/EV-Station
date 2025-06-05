<template>
  <div class="charger-list-page">
    <header class="app-header">
      <h1><i class="fas fa-charging-station"></i> Charging Stations</h1>
      <nav class="app-nav">
        <button @click="toggleView('list')" :class="{ active: currentView === 'list' }" class="view-toggle-button">
          <i class="fas fa-list"></i> <span class="button-text">List</span>
        </button>
        <button @click="toggleView('map')" :class="{ active: currentView === 'map' }" class="view-toggle-button">
          <i class="fas fa-map-marked-alt"></i> <span class="button-text">Map</span>
        </button>
        <button @click="logout" class="logout-button">
          <i class="fas fa-sign-out-alt"></i> <span class="button-text">Logout</span>
        </button>
      </nav>
    </header>

    <div class="controls-section">
      <button @click="addCharger" class="add-charger-button">
        <i class="fas fa-plus-circle"></i> Add New Charger
      </button>

      <div class="filters" v-show="currentView === 'list'">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by name..."
          class="filter-input"
          aria-label="Search by name"
        />
        <select v-model="filterStatus" class="filter-select" aria-label="Filter by status">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select v-model="filterConnectorType" class="filter-select" aria-label="Filter by connector type">
          <option value="">All Connector Types</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="AC (Type 1)">AC (Type 1)</option>
          <option value="AC (Type 3)">AC (Type 3)</option>
        </select>
        <input
          type="number"
          v-model.number="filterPowerOutputMin"
          placeholder="Min Power (kW)"
          class="filter-input small-input"
          aria-label="Minimum power output in kW"
        />
        <input
          type="number"
          v-model.number="filterPowerOutputMax"
          placeholder="Max Power (kW)"
          class="filter-input small-input"
          aria-label="Maximum power output in kW"
        />
        <button @click="resetFilters" class="reset-button">
          <i class="fas fa-undo"></i> <span class="button-text">Reset</span>
        </button>
      </div>
      <p v-if="currentView === 'map' && !checkingLocation" class="map-hint">
        <i class="fas fa-mouse-pointer"></i> Click on the map to pick a location for a new charger!
      </p>
      <p v-if="checkingLocation" class="map-hint">
        <i class="fas fa-spinner fa-spin"></i> Verifying location...
      </p>
    </div>

    <div v-if="loading" class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading chargers...</div>
    <div v-else-if="error" class="error-message"><i class="fas fa-exclamation-triangle"></i> Error: {{ error }}</div>
    <div v-else-if="!filteredChargers.length && currentView === 'list'" class="no-chargers">
      <i class="fas fa-plug"></i> No charging stations found matching your criteria.
    </div>
     <div v-else-if="!chargers.length && currentView === 'list'" class="no-chargers">
      <i class="fas fa-plug"></i> No charging stations found.
    </div>
    <div v-else-if="!chargers.length && currentView === 'map'" class="no-chargers">
      <i class="fas fa-map-signs"></i> No charging stations to display on map. Click to add one!
    </div>


    <div v-show="currentView === 'list' && filteredChargers.length > 0" class="charger-grid">
      <div v-for="charger in filteredChargers" :key="charger.id || charger._id" class="charger-card">
        <div class="card-header">
            <h3>{{ charger.name }}</h3>
            <span :class="['status-badge', charger.status === 'Active' ? 'status-active-bg' : 'status-inactive-bg']">
                <i :class="charger.status === 'Active' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ charger.status }}
            </span>
        </div>
        <div class="card-body">
            <p><i class="fas fa-map-marker-alt icon-prefix"></i><strong>Location:</strong> {{ charger.location?.latitude?.toFixed(4) || 'N/A' }}, {{ charger.location?.longitude?.toFixed(4) || 'N/A' }}</p>
            <p v-if="charger.addressDisplayName"><i class="far fa-address-card icon-prefix"></i><strong>Address:</strong> {{ charger.addressDisplayName }}</p>
            <p v-else><i class="far fa-address-card icon-prefix"></i><strong>Address:</strong> N/A</p>
            <p><i class="fas fa-bolt icon-prefix"></i><strong>Power:</strong> {{ charger.powerOutput }} kW</p>
            <p><i class="fas fa-plug icon-prefix"></i><strong>Connector:</strong> {{ charger.connectorType }}</p>
        </div>
        <div class="card-actions">
          <button @click="editCharger(charger)" class="edit-button"><i class="fas fa-edit"></i> Edit</button>
          <button @click="deleteCharger(charger.id || charger._id)" class="delete-button"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      </div>
    </div>

    <div v-show="currentView === 'map'" class="map-view-container">
      <MapView ref="mapView" :chargers="chargers" @map-clicked="handleMapClickEvent" />
    </div>

    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <ChargerForm
          :charger="currentCharger"
          :initialCoordinates="mapClickedCoords"
          :initialLocationName="clickedLocationName" @save-charger="handleSaveCharger"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script>
// Your existing <script> section remains the same.
// Make sure Axios is imported, and Font Awesome is globally available or imported here if needed.
import axios from 'axios';
import ChargerForm from '../components/ChargerForm.vue';
import MapView from '../components/MapView.vue';

export default {
  name: 'ChargerListPage',
  components: {
    ChargerForm,  
    MapView
  },
  data() {
    return {
      chargers: [],
      loading: false,
      error: null,
      showAddModal: false,
      showEditModal: false,
      currentCharger: null,
      mapClickedCoords: null,
      clickedLocationName: null, // Stores name of the location clicked on map
      checkingLocation: false,   // For loading indicator during Nominatim call
      searchQuery: '',
      filterStatus: '',
      filterConnectorType: '',
      filterPowerOutputMin: null,
      filterPowerOutputMax: null,
      currentView: 'list'
    };
  },
  computed: {
    filteredChargers() {
      let filtered = this.chargers;
      if (this.searchQuery) {
        filtered = filtered.filter(charger =>
          charger.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.filterStatus) {
        filtered = filtered.filter(charger => charger.status === this.filterStatus);
      }
      if (this.filterConnectorType) {
        filtered = filtered.filter(charger => charger.connectorType === this.filterConnectorType);
      }
      if (this.filterPowerOutputMin !== null && this.filterPowerOutputMin !== '') {
        filtered = filtered.filter(charger => charger.powerOutput >= parseFloat(this.filterPowerOutputMin));
      }
      if (this.filterPowerOutputMax !== null && this.filterPowerOutputMax !== '') {
        filtered = filtered.filter(charger => charger.powerOutput <= parseFloat(this.filterPowerOutputMax));
      }
      return filtered;
    }
  },
  async created() {
    await this.fetchChargers();
  },
  methods: {
    async fetchChargers() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/chargers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.chargers = response.data; 
      } catch (err) {
        console.error('Error fetching chargers:', err);
        this.error = err.response?.data?.message || 'Failed to fetch charging stations.';
        if (err.response?.status === 401 || err.message?.includes('token')) {
          this.$router.push('/');
        }
      } finally {
        this.loading = false;
      }
    },

    async checkLocationSuitability(latitude, longitude) {
        this.checkingLocation = true;
        try {
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            const response = await axios.get(nominatimUrl, {
                headers: { 'User-Agent': 'EVChargingApp/1.0 (contact@example.com)' } 
            });
            const data = response.data;
            console.log(`Nominatim Raw Response for ${latitude},${longitude}:`, JSON.stringify(data, null, 2));

            if (data.error || !data.osm_id) {
                console.warn('Nominatim error or no result:', data.error || 'No OSM ID found');
                return { isSuitable: false, name: null, error: data.error || "Location not found or identifiable." };
            }
            const displayName = data.display_name;
            const placeType = data.type?.toLowerCase();
            const category = data.category?.toLowerCase();
            const address = data.address || {};
            const waterCategories = ['water', 'waterway'];
            const waterTypes = ['water', 'river', 'riverbank', 'lake', 'pond', 'reservoir', 'ocean', 'sea', 'bay', 'strait', 'fjord', 'canal', 'drain', 'ditch', 'coastline', 'beach', 'wetland', 'glacier', 'shoal', 'sandbar', 'spring'];
            const unsuitableNaturalTypes = ['wood', 'forest', 'fell', 'heath', 'moor', 'scrub', 'rock', 'scree', 'cliff', 'sand', 'dune', 'mud', 'marsh'];

            if (category && waterCategories.includes(category)) {
                return { isSuitable: false, name: displayName, error: `Location identified as '${category}', unsuitable.` };
            }
            if (placeType && waterTypes.includes(placeType)) {
                return { isSuitable: false, name: displayName, error: `Location identified as a '${placeType}', unsuitable.` };
            }
            if (category === 'natural' && placeType && unsuitableNaturalTypes.includes(placeType)) {
                 if (!address.road && !address.building && !address.amenity) {
                    return { isSuitable: false, name: displayName, error: `Location is a natural area ('${placeType}') without nearby infrastructure, unsuitable.` };
                 }
            }
            const hasRoadAccess = address.road || address.highway || address.footway || address.path;
            const isBuilding = category === 'building' || placeType === 'building' || address.building;
            const isAmenity = category === 'amenity' || placeType === 'amenity' || address.amenity;
            const inPopulatedPlace = address.city || address.town || address.village || address.suburb || address.hamlet || address.neighbourhood || address.residential || address.commercial || address.industrial;

            if ((isBuilding && hasRoadAccess) || (isAmenity && (hasRoadAccess || inPopulatedPlace)) || (hasRoadAccess && inPopulatedPlace)) {
                return { isSuitable: true, name: displayName, addressDetails: address };
            }
            const addressPartCount = Object.keys(address).length;
            if (addressPartCount > 3 && displayName) {
                if (placeType && (waterTypes.includes(placeType) || unsuitableNaturalTypes.includes(placeType))) {
                    return { isSuitable: false, name: displayName, error: `Location type '${placeType}' is unsuitable despite address details.` };
                }
                return { isSuitable: true, name: displayName, addressDetails: address };
            }
            return { isSuitable: false, name: displayName || "Unnamed Area", error: "Location does not have clear land-based features suitable for a charger." };
        } catch (err) {
            console.error('Error in checkLocationSuitability:', err);
            if (err.response) {
                console.error('Nominatim Response Error Data:', err.response.data, 'Status:', err.response.status);
            }
            return { isSuitable: false, name: null, error: 'Service error while verifying location. Please try again.' };
        } finally {
            this.checkingLocation = false;
        }
    },

    async handleMapClickEvent(coords) {
      this.mapClickedCoords = null;
      this.clickedLocationName = null;
      const locationCheckResult = await this.checkLocationSuitability(coords.latitude, coords.longitude);
      console.log('Location Check Result:', locationCheckResult);
      if (locationCheckResult.isSuitable && locationCheckResult.name) {
        this.mapClickedCoords = coords;
        this.clickedLocationName = locationCheckResult.name;
        this.currentCharger = null;
        this.showAddModal = true;
      } else {
        const errorMessage = locationCheckResult.error || (locationCheckResult.isSuitable && !locationCheckResult.name ? "Could not retrieve location name." : 'This location is not suitable for adding a charger.');
        alert(errorMessage);
        console.warn('Map click unsuitable or name missing:', errorMessage, locationCheckResult);
      }
    },

    addCharger() {
      this.currentCharger = null;
      this.mapClickedCoords = null;
      this.clickedLocationName = null;
      this.showAddModal = true;
    },

    async handleSaveCharger(chargerData) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.error = 'Not authenticated. Please log in.';
        this.$router.push('/');
        return;
      }
      try {
        if (chargerData._id || chargerData.id) { 
          const chargerId = chargerData.id || chargerData._id;
          const response = await axios.put(
            `${process.env.VUE_APP_BACKEND_URL}/chargers/${chargerId}`,
            chargerData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const index = this.chargers.findIndex(c => (c.id || c._id) === (response.data.id || response.data._id));
          if (index !== -1) {
            this.chargers.splice(index, 1, response.data);
          }
        } else {
          const response = await axios.post(
            `${process.env.VUE_APP_BACKEND_URL}/chargers`,
            chargerData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.chargers.push(response.data);
        }
        this.closeModal();
      } catch (err) {
        console.error('Error saving charger:', err.response ? err.response.data : err.message);
        this.error = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to save charger.';
      }
    },

    editCharger(charger) {
      this.currentCharger = { ...charger };
      this.mapClickedCoords = null;
      this.clickedLocationName = charger.addressDisplayName || null; 
      this.showEditModal = true;
    },

    async deleteCharger(id) {
      if (!confirm('Are you sure you want to delete this charging station?')) {
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        this.error = 'Not authenticated. Please log in.';
        this.$router.push('/');
        return;
      }
      try {
        await axios.delete(`${process.env.VUE_APP_BACKEND_URL}/chargers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.chargers = this.chargers.filter(charger => (charger.id || charger._id) !== id);
      } catch (err) {
        console.error('Error deleting charger:', err);
        this.error = err.response?.data?.message || 'Failed to delete charger.';
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.currentCharger = null;
      this.mapClickedCoords = null;
      this.clickedLocationName = null;
    },

    resetFilters() {
      this.searchQuery = '';
      this.filterStatus = '';
      this.filterConnectorType = '';
      this.filterPowerOutputMin = null;
      this.filterPowerOutputMax = null;
    },

    toggleView(view) {
      this.currentView = view;
      if (view === 'map') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.mapView && this.$refs.mapView.invalidateMapSize) {
              this.$refs.mapView.invalidateMapSize();
            }
          }, 50);
        });
      }
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/');
    }
  }
};

</script>

<style scoped>
/* --- Base & Theming (Conceptual) --- */
:root { /* Not usable directly in scoped CSS, but use these values consistently */
  --primary-color: #007bff;
  --primary-hover-color: #0056b3;
  --secondary-color: #6c757d;
  --secondary-hover-color: #5a6268;
  --success-color: #28a745;
  --success-hover-color: #218838;
  --danger-color: #dc3545;
  --danger-hover-color: #c82333;
  --warning-color: #ffc107;
  --warning-hover-color: #e0a800;
  --light-gray-color: #f8f9fa;
  --medium-gray-color: #e9ecef;
  --dark-gray-color: #343a40;
  --text-color: #212529;
  --text-muted-color: #6c757d;
  --border-color: #dee2e6;
  --border-radius: 0.3rem;
  --box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  --box-shadow-lg: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
}

.charger-list-page {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
  background-color: var(--light-gray-color, #f8f9fa); /* Use CSS var or fallback */
  color: var(--text-color, #212529);
  min-height: 100vh;
}

/* --- Header --- */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #dee2e6);
}

.app-header h1 {
  color: var(--dark-gray-color, #343a40);
  font-size: 2.2em;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-nav {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* --- General Button Styling --- */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Space between icon and text */
  padding: 10px 18px;
  border: none;
  border-radius: var(--border-radius, 0.3rem);
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.1s ease;
  text-decoration: none; /* For router-link styled as button */
  white-space: nowrap;
}
button:hover {
  opacity: 0.9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
button:active {
    transform: translateY(1px);
}


.view-toggle-button {
  background-color: var(--secondary-color, #6c757d);
  color: white;
}
.view-toggle-button.active {
  background-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}
.view-toggle-button:hover:not(.active) {
  background-color: var(--secondary-hover-color, #5a6268);
}

.logout-button {
  background-color: var(--danger-color, #dc3545);
  color: white;
}
.logout-button:hover {
  background-color: var(--danger-hover-color, #c82333);
}

/* --- Controls Section --- */
.controls-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #fff;
  border-radius: var(--border-radius, 0.3rem);
  box-shadow: var(--box-shadow, 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05));
  gap: 15px;
}

.add-charger-button {
  background-color: var(--success-color, #28a745);
  color: white;
  font-size: 1em;
}
.add-charger-button:hover {
  background-color: var(--success-hover-color, #218838);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  flex-grow: 1; /* Allow filters to take available space */
}

.filter-input,
.filter-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: var(--border-radius, 0.3rem);
  font-size: 0.9em;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  outline: none;
}

.filter-input.small-input {
  max-width: 140px;
}

.reset-button {
  background-color: var(--secondary-color, #6c757d);
  color: white;
  padding: 10px 15px;
}
.reset-button:hover {
  background-color: var(--secondary-hover-color, #5a6268);
}

/* --- Messages & Hints --- */
.loading-message,
.error-message,
.no-chargers,
.map-hint {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  font-size: 1.1em;
  border-radius: var(--border-radius, 0.3rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.map-hint {
    background-color: var(--medium-gray-color, #e9ecef);
    color: var(--text-muted-color, #6c757d);
    font-style: italic;
    border: 1px dashed var(--border-color, #dee2e6);
}
.loading-message {
  color: var(--primary-color, #007bff);
  background-color: rgba(0,123,255,.05);
}
.error-message {
  color: var(--danger-color, #dc3545);
  background-color: rgba(220,53,69,.05);
}
.no-chargers {
  color: var(--text-muted-color, #6c757d);
  background-color: var(--light-gray-color, #f8f9fa);
}


/* --- Charger Grid & Card --- */
.charger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Slightly larger min for better content fit */
  gap: 25px;
}

.charger-card {
  background-color: #ffffff;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--border-radius, 0.3rem) + 0.1rem; /* Slightly more rounding */
  padding: 0; /* Remove padding, handle with internal divs */
  box-shadow: var(--box-shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
  transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  display: flex;
  flex-direction: column; /* Ensure card actions are at the bottom */
}

.charger-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg, 0 12px 28px rgba(0, 0, 0, 0.1));
}
.card-header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-header h3 {
  margin: 0;
  color: var(--primary-color, #007bff);
  font-size: 1.4em; /* Slightly reduced for balance */
  font-weight: 600;
}
.status-badge {
    padding: 5px 10px;
    border-radius: var(--border-radius, 0.3rem);
    font-size: 0.8em;
    font-weight: bold;
    color: white;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}
.status-active-bg {
    background-color: var(--success-color, #28a745);
}
.status-inactive-bg {
    background-color: var(--danger-color, #dc3545);
}

.card-body {
    padding: 15px 20px;
    flex-grow: 1; /* Make body take available space */
}
.charger-card p {
  margin-bottom: 10px; /* Increased spacing */
  font-size: 0.9em; /* Slightly smaller for more content */
  color: var(--text-muted-color, #555);
  line-height: 1.6;
  display: flex; /* For icon alignment */
  align-items: flex-start; /* Align items to start for multi-line text */
}
.charger-card p strong {
  color: var(--dark-gray-color, #333);
  margin-left: 0.5em; /* Space after icon if any */
}
.icon-prefix {
    margin-right: 8px;
    color: var(--primary-color, #007bff);
    width: 16px; /* Fixed width for alignment */
    text-align: center;
    margin-top: 2px; /* Slight adjustment for alignment with text */
}

.card-actions {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  gap: 10px;
  justify-content: flex-end; /* Align buttons to the right */
}

.edit-button, .delete-button {
  padding: 8px 15px;
  font-size: 0.85em; /* Smaller buttons in card */
}
.edit-button {
  background-color: var(--primary-color, #007bff);
  color: white;
}
.edit-button:hover {
  background-color: var(--primary-hover-color, #0056b3);
}
.delete-button {
  background-color: var(--warning-color, #ffc107);
  color: var(--dark-gray-color, #333);
}
.delete-button:hover {
  background-color: var(--warning-hover-color, #e0a800);
}

/* --- Map View Container --- */
.map-view-container {
    height: 600px; /* Or dynamic based on screen */
    width: 100%;
    border-radius: var(--border-radius, 0.3rem);
    overflow: hidden;
    box-shadow: var(--box-shadow, 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05));
}


/* --- Modal Overlay & Content --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65); /* Slightly darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px; /* Padding for small screens */
}

.modal-content {
  background-color: #ffffff;
  padding: 25px 30px; /* Adjusted padding */
  border-radius: var(--border-radius, 0.3rem) + 0.2rem;
  box-shadow: var(--box-shadow-lg, 0 5px 15px rgba(0, 0, 0, 0.3));
  max-width: 600px;
  width: 100%; /* Full width on small screens, max-width limits it */
  position: relative;
  max-height: 90vh; /* Prevent modal from being too tall */
  overflow-y: auto; /* Scroll if content overflows */
}

/* --- Media Queries for Responsiveness --- */

/* Tablet and smaller desktops */
@media (max-width: 992px) {
  .app-header h1 {
    font-size: 1.8em;
  }
  .filters {
    justify-content: flex-start; /* Align filters to start */
  }
  .filter-input, .filter-select {
      flex-basis: calc(50% - 10px); /* Two filters per row approx */
  }
  .filter-input.small-input {
      flex-basis: calc(33.33% - 10px);
  }
}

/* Tablets portrait and large phones */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .app-nav {
    width: 100%;
    justify-content: space-around; /* Distribute nav buttons */
  }
  .view-toggle-button, .logout-button {
      flex-grow: 1; /* Make buttons take equal space */
      font-size: 0.9em;
      padding: 8px 10px;
  }
  .controls-section {
    flex-direction: column;
    align-items: stretch; /* Make children take full width */
  }
  .add-charger-button {
      margin-bottom: 15px; /* Space below add button when stacked */
  }
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-input, .filter-select, .filter-input.small-input {
      max-width: none; /* Allow filters to take full width */
      width: 100%;
      flex-basis: auto;
  }
  .charger-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Adjust min card width */
  }
  .map-hint {
    font-size: 1em;
  }
}

/* Small phones */
@media (max-width: 576px) {
  .charger-list-page {
    padding: 10px;
  }
  .app-header h1 {
    font-size: 1.6em;
  }
   .app-nav .button-text {
    display: none; /* Hide text, show only icon on very small screens */
  }
  .view-toggle-button, .logout-button, .reset-button {
    padding: 10px; /* Adjust padding for icon only buttons */
  }
  .add-charger-button {
      font-size: 0.95em;
  }
  .charger-grid {
    grid-template-columns: 1fr; /* Single column for cards */
    gap: 15px;
  }
  .card-header h3 {
    font-size: 1.2em;
  }
  .charger-card p {
    font-size: 0.85em;
  }
  .modal-content {
    padding: 20px;
    margin: 10px; /* Ensure modal is not touching screen edges */
    max-height: calc(100vh - 20px);
  }
}

</style>