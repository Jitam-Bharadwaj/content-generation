const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

// Loading the configuration from JSON file
const configPath = path.join(__dirname, '../config/models.json');
const modelsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let currentModel = modelsConfig.DEFAULT;

const isModelAvailable = (modelName) => {
    const config = modelsConfig[modelName];
    switch (modelName) {
        case 'GEMINI':
            return !!config.GEMINI_API_KEY;
        case 'OPENAI':
            return !!config.OPENAI_API_KEY;
        case 'CLAUDE':
            return !!config.CLAUDE_API_KEY;
        default:
            return false;
    }
};

const getAvailableModels = () => {
    return modelsConfig.MODEL.filter(model => isModelAvailable(model));
};

const getModelConfig = () => {
    return modelsConfig[currentModel];
};

const setModel = (model) => {
    const upperModel = model.toUpperCase();
    if (!modelsConfig.MODEL.includes(upperModel)) {
        throw new Error(`Model ${model} not supported.`);
    }
    if (!isModelAvailable(upperModel)) {
        throw new Error(`Model ${model} is not available. API key not configured.`);
    }
    currentModel = upperModel;
    return `Switched to ${modelsConfig[currentModel].NAME} model.`;
};

const getModel = () => {
    const config = getModelConfig();
    if (!isModelAvailable(currentModel)) {
        throw new Error(`Current model ${currentModel} is not available. API key not configured.`);
    }

    switch (currentModel) {
        case 'GEMINI':
            const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
            return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        case 'OPENAI':
            if (!config.OPENAI_API_KEY) {
                throw new Error('OpenAI API key not configured');
            }
            return new OpenAI({ apiKey: config.OPENAI_API_KEY });
        case 'CLAUDE':
            if (!config.CLAUDE_API_KEY) {
                throw new Error('Claude API key not configured');
            }
            throw new Error('Claude integration not implemented yet');
        default:
            throw new Error(`Model ${currentModel} not supported.`);
    }
};

module.exports = {
    getModel,
    setModel,
    getModelConfig,
    getAvailableModels,
    isModelAvailable
};