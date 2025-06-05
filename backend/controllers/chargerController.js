// backend/controllers/chargerController.js - UPDATED PRODUCTION VERSION
const ChargingStation = require('../models/ChargingStation');

// @desc    Create a new charging station
// @route   POST /api/chargers
// @access  Private
const createChargingStation = async (req, res) => {
    // Destructure including the nested location and new addressDisplayName
    const { name, location, status, powerOutput, connectorType, addressDisplayName } = req.body;

    // Validate required fields, including nested latitude and longitude
    if (!name || !location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number' || !status || typeof powerOutput !== 'number' || !connectorType) {
        return res.status(400).json({ message: 'Please provide all required fields: name, location (with latitude and longitude), status, powerOutput, and connectorType.' });
    }

    try {
        const newStationData = {
            name,
            location: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude] // GeoJSON format: [longitude, latitude]
            },
            status,
            powerOutput,
            connectorType,
            addressDisplayName: addressDisplayName !== undefined ? addressDisplayName : null, // Handle if not provided
            user: req.user._id // Assuming req.user is populated by auth middleware and contains _id
        };

        const newStation = await ChargingStation.create(newStationData);
        // The response will be transformed by Mongoose's toJSON/toObject if schema a transform is set
        res.status(201).json(newStation);
    } catch (error) {
        console.error('Error creating charging station:', error.message);
        if (error.name === 'ValidationError') {
            // Construct a user-friendly error message from validation errors
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: 'Server error while creating charging station' });
    }
};

// @desc    Get all charging stations (e.g., for the logged-in user)
// @route   GET /api/chargers
// @access  Private
const getChargingStations = async (req, res) => {
    try {
        // Example: Fetch stations created by the current user.
        // Modify this query based on your application's access rules (e.g., an admin might see all).
        const stations = await ChargingStation.find({ user: req.user._id }).populate('user', 'username email');
        // The response objects will be transformed by Mongoose's toJSON/toObject if a schema transform is set
        res.status(200).json(stations);
    } catch (error) {
        console.error('Error fetching charging stations:', error.message);
        res.status(500).json({ message: 'Server error while fetching charging stations' });
    }
};

// @desc    Update a charging station
// @route   PUT /api/chargers/:id
// @access  Private
const updateChargingStation = async (req, res) => {
    const { name, location, status, powerOutput, connectorType, addressDisplayName } = req.body;
    const stationId = req.params.id;

    try {
        const station = await ChargingStation.findById(stationId);

        if (!station) {
            return res.status(404).json({ message: 'Charging station not found' });
        }

        // Check if the logged-in user owns the station
        if (station.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this station' });
        }

        // Construct the update object to only include fields that are actually being updated
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (status !== undefined) updateFields.status = status;
        if (powerOutput !== undefined) updateFields.powerOutput = powerOutput;
        if (connectorType !== undefined) updateFields.connectorType = connectorType;
        
        // Allow addressDisplayName to be set to null (to clear it) or a new string
        if (addressDisplayName !== undefined) {
            updateFields.addressDisplayName = addressDisplayName;
        }

        // Handle location update (transform to GeoJSON)
        if (location) {
            if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
                updateFields.location = {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude]
                };
            } else {
                // If location object is present but incomplete or types are wrong
                return res.status(400).json({ message: 'Invalid location data provided. If updating location, both latitude and longitude must be numbers.' });
            }
        }

        // If no fields to update were provided (besides potentially empty location)
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const updatedStation = await ChargingStation.findByIdAndUpdate(
            stationId,
            { $set: updateFields }, // Use $set to update only provided fields
            { new: true, runValidators: true, context: 'query' } // new: true returns the modified document
        );                                                        // runValidators: true ensures schema validations are run

        if (!updatedStation) { // Should ideally not be reached if findById found it, but defensive
            return res.status(404).json({ message: 'Charging station not found after update attempt.' });
        }
        // The response will be transformed by Mongoose's toJSON/toObject if a schema transform is set
        res.status(200).json(updatedStation);
    } catch (error) {
        console.error('Error updating charging station:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: 'Server error while updating charging station' });
    }
};

// @desc    Delete a charging station
// @route   DELETE /api/chargers/:id
// @access  Private
const deleteChargingStation = async (req, res) => {
    const stationId = req.params.id;
    try {
        const station = await ChargingStation.findById(stationId);

        if (!station) {
            return res.status(404).json({ message: 'Charging station not found' });
        }

        // Check if the logged-in user owns the station
        if (station.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this station' });
        }

        await ChargingStation.deleteOne({ _id: stationId }); // or station.remove() if you have middleware
        res.status(200).json({ message: 'Charging station removed successfully' });
    } catch (error) {
        console.error('Error deleting charging station:', error.message);
        res.status(500).json({ message: 'Server error while deleting charging station' });
    }
};

module.exports = {
    createChargingStation,
    getChargingStations,
    updateChargingStation,
    deleteChargingStation
};