<template>
  <div class="charger-form-container">
    <h3>{{ formTitle }}</h3>
    <form @submit.prevent="saveCharger">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>

      <div v-if="isAddingViaMapClick && initialLocationName" class="form-group">
        <label>Selected via Map:</label>
        <p class="location-name-display">{{ initialLocationName }}</p>
      </div>

      <div class="form-group location-group">
        <label>Location Coordinates:</label>
        <input
          type="number"
          step="any"
          id="latitude"
          v-model.number="formData.latitude"
          placeholder="Latitude (-90 to +90)"
          required
          :disabled="isAddingViaMapClick"
          @input="handleCoordinateInputChange('latitude')"
        />
        <input
          type="number"
          step="any"
          id="longitude"
          v-model.number="formData.longitude"
          placeholder="Longitude (-180 to +180)"
          required
          :disabled="isAddingViaMapClick"
          @input="handleCoordinateInputChange('longitude')"
        />
        <p v-if="latitudeError" class="error-message coord-error">{{ latitudeError }}</p>
        <p v-if="longitudeError" class="error-message coord-error">{{ longitudeError }}</p>
      </div>

      <div class="form-group" v-if="currentLocationAddress || isFetchingAddress || geocodingError">
        <label>Fetched Location Address:</label>
        <div v-if="isFetchingAddress" class="address-status">
          <p>Fetching address...</p>
        </div>
        <div v-else-if="geocodingError" class="address-status">
          <p class="error-message">{{ geocodingError }}</p>
        </div>
        <div v-else-if="currentLocationAddress && !isAddingViaMapClick" class="location-name-display">
          <p>{{ currentLocationAddress }}</p>
        </div>
         </div>


      <div class="form-group">
        <label for="status">Status:</label>
        <select id="status" v-model="formData.status" required>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div class="form-group">
        <label for="powerOutput">Power Output (kW):</label>
        <input type="number" step="0.1" id="powerOutput" v-model.number="formData.powerOutput" required />
      </div>

      <div class="form-group">
        <label for="connectorType">Connector Type:</label>
        <select id="connectorType" v-model="formData.connectorType" required>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="AC (Type 1)">AC (Type 1)</option>
          <option value="AC (Type 3)">AC (Type 3)</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-button">Save</button>
        <button type="button" @click="cancelForm" class="cancel-button">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'; // Ensure axios is imported

export default {
  name: 'ChargerForm',
  props: {
    charger: {
      type: Object,
      default: null
    },
    initialCoordinates: {
      type: Object,
      default: null
    },
    initialLocationName: { // Received from map click in parent
      type: String,
      default: null
    }
  },
  data() {
    return {
      formData: {
        _id: null,
        name: '',
        latitude: null,
        longitude: null,
        status: 'Active',
        powerOutput: null,
        connectorType: 'Type 2'
      },
      latitudeError: null,
      longitudeError: null,
      currentLocationAddress: null,  // To store fetched address from coordinates
      isFetchingAddress: false,
      geocodingError: null,
      geocodeTimeout: null, // For debouncing
    };
  },
  computed: {
    isAddingViaMapClick() {
      return !this.charger && !!this.initialCoordinates;
    },
    formTitle() {
      return this.charger ? 'Edit Charger' : 'Add New Charger';
    }
  },
  watch: {
    charger: {
      immediate: true,
      handler(newCharger) {
        this.resetAddressState();
        if (newCharger) { // Editing mode
          this.formData = {
            _id: newCharger._id,
            name: newCharger.name,
            latitude: newCharger.location?.latitude,
            longitude: newCharger.location?.longitude,
            status: newCharger.status,
            powerOutput: newCharger.powerOutput,
            connectorType: newCharger.connectorType
          };
          // Try to set address: 1. from charger object, 2. else geocode
          if (newCharger.addressDisplayName) { // Assuming backend might provide this
            this.currentLocationAddress = newCharger.addressDisplayName;
          } else if (newCharger.location?.latitude != null && newCharger.location?.longitude != null) {
            this.triggerGeocode(newCharger.location.latitude, newCharger.location.longitude, 0); // Fetch immediately for edit
          }
        } else { // Adding mode
          if (!this.initialCoordinates) { // Manual add, not map click
            this.resetForm();
          }
          // If initialCoordinates are present, its watcher will handle lat/lng.
          // initialLocationName watcher handles the address for map click.
        }
        this.clearValidationErrors();
      }
    },
    initialCoordinates: {
      immediate: true,
      handler(newCoords) {
        if (this.isAddingViaMapClick && newCoords) {
          this.resetFormFieldsForAdd(); // Reset fields but keep for map click
          this.formData.latitude = newCoords.latitude;
          this.formData.longitude = newCoords.longitude;
          this.clearValidationErrors();
        }
      }
    },
    initialLocationName: {
        immediate: true,
        handler(newName) {
            if (this.isAddingViaMapClick && newName) {
                this.currentLocationAddress = newName; // Set from map click
                this.geocodingError = null;
                this.isFetchingAddress = false;
            }
        }
    },
  },
  methods: {
    resetForm() {
      this.formData = {
        _id: null, name: '', latitude: null, longitude: null,
        status: 'Active', powerOutput: null, connectorType: 'Type 2'
      };
      this.resetAddressState();
      this.clearValidationErrors();
    },
    resetFormFieldsForAdd() { // Resets fields specifically when adding, might keep name if user typed
        // this.formData.name = ''; // Optional: clear name on map click
        this.formData._id = null;
        this.formData.status = 'Active';
        this.formData.powerOutput = null;
        this.formData.connectorType = 'Type 2';
    },
    resetAddressState() {
        this.currentLocationAddress = null;
        this.isFetchingAddress = false;
        this.geocodingError = null;
        if (this.geocodeTimeout) clearTimeout(this.geocodeTimeout);
    },
    clearValidationErrors() {
      this.latitudeError = null;
      this.longitudeError = null;
    },
    clearCoordError(field) { // Keep this if you use it for instant feedback while typing
      if (field === 'latitude') this.latitudeError = null;
      else if (field === 'longitude') this.longitudeError = null;
    },

    handleCoordinateInputChange() {
        this.clearCoordError(this.formData.latitude ? 'latitude' : 'longitude'); // Clear validation error on input
        if (!this.isAddingViaMapClick) { // Only geocode if not from map click (map click uses initialLocationName)
             this.triggerGeocode(this.formData.latitude, this.formData.longitude);
        }
    },

    triggerGeocode(lat, lon, delay = 1000) { // Default 1s debounce
        if (this.geocodeTimeout) clearTimeout(this.geocodeTimeout);

        if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
            // Don't attempt geocode if coords are not numbers or null
            this.currentLocationAddress = null; // Clear address if coords become invalid
            this.geocodingError = null; // Clear error if user is clearing inputs
            return;
        }
         // Basic range check before API call (full validation is separate)
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            this.currentLocationAddress = null;
            this.geocodingError = "Coordinates are out of valid range.";
            this.isFetchingAddress = false;
            return;
        }

        this.geocodeTimeout = setTimeout(async () => {
            this.isFetchingAddress = true;
            this.geocodingError = null;
            this.currentLocationAddress = null; // Clear previous address

            try {
                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
                const response = await axios.get(nominatimUrl, {
                // IMPORTANT: Replace with your actual app name/contact for Nominatim's usage policy
                headers: { 'User-Agent': 'EVChargingApp/1.0 (your-contact@example.com)' }
                });
                const data = response.data;
                if (data && data.display_name) {
                this.currentLocationAddress = data.display_name;
                } else if (data.error) {
                this.geocodingError = `Address lookup error: ${data.error}`;
                } else {
                this.geocodingError = 'Address not found for these coordinates.';
                }
            } catch (error) {
                console.error('Error reverse geocoding:', error);
                this.geocodingError = 'Failed to fetch address (network/service error).';
            } finally {
                this.isFetchingAddress = false;
            }
        }, delay);
    },

    validateCoordinates() {
      this.clearValidationErrors();
      let isValid = true;
      const lat = this.formData.latitude;
      const lon = this.formData.longitude;

      if (lat === null || isNaN(lat) || lat < -90 || lat > 90) {
        this.latitudeError = 'Latitude must be a number between -90 and 90.';
        isValid = false;
      }
      if (lon === null || isNaN(lon) || lon < -180 || lon > 180) {
        this.longitudeError = 'Longitude must be a number between -180 and 180.';
        isValid = false;
      }
      return isValid;
    },
    saveCharger() {
      if (this.validateCoordinates()) {
        const dataToSave = {
          _id: this.formData._id, // Will be null for new chargers
          name: this.formData.name,
          location: {
            latitude: parseFloat(this.formData.latitude),
            longitude: parseFloat(this.formData.longitude)
          },
          status: this.formData.status,
          powerOutput: parseFloat(this.formData.powerOutput),
          connectorType: this.formData.connectorType,
          // Include address if available and not actively fetching/erroring
          // Use initialLocationName if adding via map, otherwise use currentLocationAddress
          addressDisplayName: this.isAddingViaMapClick
                                ? this.initialLocationName
                                : (this.currentLocationAddress && !this.isFetchingAddress && !this.geocodingError
                                    ? this.currentLocationAddress
                                    : null)
        };
        this.$emit('save-charger', dataToSave);
      }
    },
    cancelForm() {
        this.$emit('cancel');
    }
  },
  created() {
    // Initial setup if not editing and not from map click (i.e., pure manual add)
    if (!this.charger && !this.initialCoordinates) {
        this.resetForm();
    }
  },
  beforeUnmount() {
    // Clear any pending timeout when the component is destroyed
    if (this.geocodeTimeout) {
      clearTimeout(this.geocodeTimeout);
    }
  }
};
</script>

<style scoped>
.charger-form-container {
  padding: 25px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  overflow-y: auto;
}

h3 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.location-name-display, .address-status p {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.95em;
  color: #495057;
  margin-top: 0;
  border: 1px solid #ced4da;
  word-wrap: break-word; /* Ensure long addresses wrap */
}
.address-status p.error-message {
    background-color: transparent; /* Error messages might have their own styling */
    border: none;
    padding: 0;
    color: #dc3545; /* Standard error color */
}


.location-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}
.location-group label {
  flex-basis: 100%;
  margin-bottom: 5px;
}
.location-group input {
  flex: 1;
  min-width: 120px;
}
.error-message.coord-error {
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 4px;
  text-align: left;
  flex-basis: 100%;
  order: 3;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.save-button,
.cancel-button {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  margin-left: 10px;
}

.save-button {
  background-color: #007bff;
  color: white;
}
.save-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}
.cancel-button:hover {
  background-color: #5a6268;
}
</style>