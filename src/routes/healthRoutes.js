const express = require('express');
const router = express.Router();
const healthMonitor = require('../healthMonitor.js');

// Health Check endpoint
router.get('/', async (req, res) => {
    try {
        const healthStatus = healthMonitor.getHealthStatus();
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            aiModelStatus: 'available'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;