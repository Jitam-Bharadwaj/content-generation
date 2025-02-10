const mongoose = require('mongoose');

class HealthMonitor {
    constructor() {
        this.interval = null;
    }

    getHealthStatus() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            aiModelStatus: 'available',
            timestamp: new Date().toISOString()
        };
    }

    logHealthStatus() {
        const status = this.getHealthStatus();
        console.log('\nSystem Health Status:');
        console.log('===================');
        console.log(`Status: ${status.status}`);
        console.log(`Uptime: ${status.uptime.toFixed(2)} seconds`);
        console.log(`Database: ${status.databaseStatus}`);
        console.log(`AI Model: ${status.aiModelStatus}`);
        console.log(`Timestamp: ${status.timestamp}`);
        console.log('===================\n');
    }

    startMonitoring(interval = 60000) {
        this.interval = setInterval(() => this.logHealthStatus(), interval);
    }

    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = new HealthMonitor();