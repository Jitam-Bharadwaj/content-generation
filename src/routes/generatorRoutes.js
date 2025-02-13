const express = require('express');
const router = express.Router();
const GeneratorService = require('../services/generatorService');
const Chat = require('../models/ChatsFinal');

/**
 * @swagger
 * tags:
 *   name: Generator
 *   description: Content generation endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TopicRequest:
 *       type: object
 *       required:
 *         - topic
 *       properties:
 *         topic:
 *           type: string
 *           description: The topic to generate content for
 *           example: "artificial intelligence in healthcare"
 *     ModelRequest:
 *       type: object
 *       required:
 *         - model
 *       properties:
 *         model:
 *           type: string
 *           description: The AI model to switch to
 *           enum: [GEMINI, OPENAI, CLAUDE]
 *     GeneratorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 */

/**
 * @swagger
 * /api/generate/keywords:
 *   post:
 *     tags: [Generator]
 *     summary: Generate SEO keywords
 *     description: Generates a list of relevant SEO keywords for the given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicRequest'
 *     responses:
 *       200:
 *         description: Successfully generated keywords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.post('/keywords', async (req, res) => {
    try {
        const startTime = Date.now();
        const keywords = await GeneratorService.generateKeywords(req.body.topic);
        const slug = req.body.topic.toLowerCase().replace(/\s+/g, '-');

        // Add random number or symbol or alphabet to the slug 
        const randomSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const randomNumbers = Math.floor(Math.random() * 100000000);

        const randomChoice = Math.random() < 0.5 
        ? randomSymbols[Math.floor(Math.random() * randomSymbols.length)] 
        : randomNumbers;

        const finalSlug = `${slug}-${randomChoice}`;

        // array of objects with "keyword" and "relevance" fields
        const parsedKeywords = Array.isArray(keywords) 
            ? keywords.map(k => ({
                keyword: k.keyword,
                relevance: k.relevance
            }))
            : [];

        const chat = new Chat({
            requestType: 'keywords',
            input: req.body.topic,
            slug: finalSlug,
            output: JSON.stringify(parsedKeywords),
            keywords: parsedKeywords,
            metadata: {
                processTime: Date.now() - startTime
            }
        });
        await chat.save();

        res.json({
            success: true,
            data: parsedKeywords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/**
 * @swagger
 * /api/generate/title:
 *   post:
 *     tags: [Generator]
 *     summary: Generate title suggestions
 *     description: Generates engaging titles for the given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicRequest'
 *     responses:
 *       200:
 *         description: Successfully generated titles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.post('/title', async (req, res) => {
    try {
        const startTime = Date.now();
        const titles = await GeneratorService.generateTitle(req.body.topic);
        const slug = req.body.topic.toLowerCase().replace(/\s+/g, '-');

        // Add random number or symbol or alphabet to the slug 
        const randomSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const randomNumbers = Math.floor(Math.random() * 100000000); // Generates a random number between 0-999

        const randomChoice = Math.random() < 0.5 
        ? randomSymbols[Math.floor(Math.random() * randomSymbols.length)] 
        : randomNumbers;

        const finalSlug1 = `${slug}-${randomChoice}`;

        const chat = new Chat({
            requestType: 'title',
            input: req.body.topic,
            slug: finalSlug1,
            output: JSON.stringify(titles),
            titles: titles,
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

/**
 * @swagger
 * /api/generate/meta:
 *   post:
 *     tags: [Generator]
 *     summary: Generate meta description
 *     description: Generates SEO-optimized meta description for the given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicRequest'
 *     responses:
 *       200:
 *         description: Successfully generated meta description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/meta', async (req, res) => {
    try {
        const startTime = Date.now();
        const meta = await GeneratorService.generateMeta(req.body.topic);
        const slug = req.body.topic.toLowerCase().replace(/\s+/g, '-');

        // Add random number or symbol or alphabet to the slug 
        const randomSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const randomNumbers = Math.floor(Math.random() * 100000000); // Generates a random number between 0-999

        const randomChoice = Math.random() < 0.5 
        ? randomSymbols[Math.floor(Math.random() * randomSymbols.length)] 
        : randomNumbers;

        const finalSlug2 = `${slug}-${randomChoice}`;

        const chat = new Chat({
            requestType: 'meta',
            input: req.body.topic,
            slug: finalSlug2,
            output: JSON.stringify(meta),
            meta: meta,
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

/**
 * @swagger
 * /api/generate/content:
 *   post:
 *     tags: [Generator]
 *     summary: Generate article content
 *     description: Generates detailed article content for the given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicRequest'
 *     responses:
 *       200:
 *         description: Successfully generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/content', async (req, res) => {
    try {
        const startTime = Date.now();
        const content = await GeneratorService.generateContent(req.body.topic);
        const slug = req.body.topic.toLowerCase().replace(/\s+/g, '-');

        // Add random number or symbol or alphabet to the slug 
        const randomSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const randomNumbers = Math.floor(Math.random() * 100000000); // Generates a random number between 0-999

        const randomChoice = Math.random() < 0.5 
        ? randomSymbols[Math.floor(Math.random() * randomSymbols.length)] 
        : randomNumbers;

        const finalSlug3 = `${slug}-${randomChoice}`;

        const chat = new Chat({
            requestType: 'content',
            input: req.body.topic,
            slug: finalSlug3,
            output: content,
            content: content,
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

/**
 * @swagger
 * /api/generate/all:
 *   post:
 *     tags: [Generator]
 *     summary: Generate all content types
 *     description: Generates keywords, titles, meta description, and content for the given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicRequest'
 *     responses:
 *       200:
 *         description: Successfully generated all content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     keywords:
 *                       type: array
 *                       items:
 *                         type: string
 *                     titles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *                     content:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/all', async (req, res) => {
    try {
        const startTime = Date.now();

        // Step 1: Generate keywords
        const keywords = await GeneratorService.generateKeywords(req.body.topic);

        // Step 2: Present keywords to the user
        // In a real scenario, this would be handled by the frontend which would allow the user to select keywords
        const selectedKeywords = req.body.selectedKeywords || keywords.map(k => k.keyword);

        // Step 3: Generats content based on selected keywords
        const allContent = await GeneratorService.generateAllContent(req.body.topic, selectedKeywords);

        // Step 4: Stores the generated data in the Mongo atlas database
        const slug = allContent.titles[0].toLowerCase().replace(/\s+/g, '-');

        const chat = new Chat({
            requestType: 'all',
            input: req.body.topic,
            slug: slug,
            output: JSON.stringify(allContent),
            keywords: allContent.keywords,
            titles: allContent.titles,
            meta: allContent.meta,
            content: allContent.content,
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