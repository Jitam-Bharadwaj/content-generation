const express = require('express');
const router = express.Router();
const GeneratorService = require('../services/generatorService');
const Chat = require('../models/chatModel');

// keywords endpoint
router.post('/keywords', async (req, res) => {
    try {
        const startTime = Date.now();
        const keywords = await GeneratorService.generateKeywords(req.body.topic);
        
        const chat = new Chat({
            requestType: 'keywords',
            input: req.body.topic,
            output: keywords,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: keywords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// title endpoint
router.post('/title', async (req, res) => {
    try {
        const startTime = Date.now();
        const titles = await GeneratorService.generateTitle(req.body.topic);
        
        const chat = new Chat({
            requestType: 'title',
            input: req.body.topic,
            output: titles,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: titles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// meta endpoint
router.post('/meta', async (req, res) => {
    try {
        const startTime = Date.now();
        const meta = await GeneratorService.generateMeta(req.body.topic);
        
        const chat = new Chat({
            requestType: 'meta',
            input: req.body.topic,
            output: meta,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: meta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// content endpoint
router.post('/content', async (req, res) => {
    try {
        const startTime = Date.now();
        const content = await GeneratorService.generateContent(req.body.topic);
        
        const chat = new Chat({
            requestType: 'content',
            input: req.body.topic,
            output: content,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// switch model endpoint
router.post('/switch-model', async (req, res) => {
    try {
      const { model } = req.body;
      const result = await GeneratorService.switchModel(model);
      res.json({
        success: true,
        message: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/all', async (req, res) => {
    try {
        const startTime = Date.now();
        const allContent = await GeneratorService.generateAllContent(req.body.topic);
        
        const chat = new Chat({
            requestType: 'all',
            input: req.body.topic,
            output: allContent,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: allContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;