// backend/models/ChargingStation.js
const mongoose = require('mongoose');

const ChargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Charger name is required.'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: { // Array of [longitude, latitude]
      type: [Number],
      required: [true, 'Coordinates (longitude, latitude) are required.'],
      validate: {
          validator: function(coords) {
              if (!Array.isArray(coords) || coords.length !== 2) return false;
              const [longitude, latitude] = coords;
              return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
          },
          message: props => `${props.value} is not a valid coordinate pair. Longitude must be -180 to 180, Latitude -90 to 90.`
      }
    }
  },
  addressDisplayName: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: [true, 'Status is required.']
  },
  powerOutput: { // in kW
    type: Number,
    required: [true, 'Power output is required.'],
    min: [0, 'Power output cannot be negative.']
  },
  connectorType: {
    type: String,
    required: [true, 'Connector type is required.'],
    enum: ['Type 2', 'CCS', 'CHAdeMO', 'AC (Type 1)', 'AC (Type 3)'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A user must be associated with the charging station.']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create a 2dsphere index on the location field for geospatial queries
ChargingStationSchema.index({ location: '2dsphere' });

// Customize the JSON output for documents using this schema
ChargingStationSchema.set('toJSON', {
    virtuals: true,     // Ensure virtuals (like 'id') are included if you use them
    versionKey: false,  // Do not include the __v field
    transform: function (doc, ret) {
        // 'ret' is the plain object representation of the Mongoose document

        // delete ret._id; // Optional: Mongoose creates a virtual 'id' getter by default.
                           // If you prefer to only have 'id' and not '_id', you can delete ret._id.
                           // However, clients often handle either.

        // Transform the 'location' field for client-side convenience
        if (ret.location && ret.location.type === 'Point' && ret.location.coordinates) {
            ret.location = {
                latitude: ret.location.coordinates[1],  // GeoJSON coordinates are [longitude, latitude]
                longitude: ret.location.coordinates[0]
            };
        }
        // Any other transformations can go here (e.g., renaming fields, removing sensitive data)
    }
});

module.exports = mongoose.model('ChargingStation', ChargingStationSchema);