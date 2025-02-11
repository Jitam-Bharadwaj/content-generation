const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');
const ChatService = require('../services/chatService');
const { getModel, getModelConfig } = require('../models/models');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat interaction endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User's input message
 *           example: "Tell me about artificial intelligence"
 *     ChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         res:
 *           type: object
 *           properties:
 *             data:
 *               type: string
 *     ChatHistory:
 *       type: object
 *       properties:
 *         userInput:
 *           type: string
 *         aiResponse:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message and get AI response
 *     description: Send a message to the currently selected AI model and receive a response
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Successful chat response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 res:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
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
router.post('/', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const model = getModel();
        const modelConfig = getModelConfig();

        let aiResponse;
        if (modelConfig.NAME === 'GEMINI') {
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            aiResponse = response.text();
        } else if (modelConfig.NAME === 'OPENAI') {
            const response = await model.chat.completions.create({
                model: modelConfig.model,
                messages: [{ role: 'user', content: userMessage }]
            });
            aiResponse = response.choices[0].message.content;
        } else {
            throw new Error('Unsupported model for chat');
        }

        const chat = new Chat({
            userInput: userMessage,
            aiResponse: aiResponse,
            modelUsed: modelConfig.NAME
        });
        await chat.save();

        res.json({
            success: true,
            res: {
                data: aiResponse
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat history
 *     description: Retrieve the history of all chat interactions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of records to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of chat interactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 res:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatHistory'
 *       500:
 *         description: Server error
 */
router.get('/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const history = await Chat.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Chat.countDocuments();

        res.json({
            success: true,
            res: {
                data: history,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;