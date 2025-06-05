// backend/routes/chargers.js
const express = require('express');
const router = express.Router();
const {
    createChargingStation,
    getChargingStations,
    updateChargingStation,
    deleteChargingStation
} = require('../controllers/chargerController');
const { protect } = require('../middleware/auth'); // Import the protect middleware

// All these routes will be protected
router.post('/', protect, createChargingStation);
router.get('/', protect, getChargingStations); // Assuming you want all stations to be viewable by logged-in users
router.put('/:id', protect, updateChargingStation);
router.delete('/:id', protect, deleteChargingStation);

module.exports = router;