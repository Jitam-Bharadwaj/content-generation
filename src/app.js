const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/database');
const healthMonitor = require('./healthMonitor');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// to start the health monitoring
healthMonitor.startMonitoring();

app.use('/api/health', require('./routes/healthRoutes'));

// Swagger configuration - only for generator routes
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Content Generation API',
            version: '1.0.0',
            description: 'API for generating various types of content'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`
            }
        ]
    },
    apis: ['./routes/generatorRoutes.js']
    
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/generate', require('./routes/generatorRoutes'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    // Logging initial health status
    healthMonitor.logHealthStatus();

    console.log(`Server running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

module.exports = app;