const { getModel, getModelConfig } = require('../models/models');

class ChatService {
    /**
     * Process a chat message and get AI response
     * @param {string} userMessage - The user's input message
     * @returns {Promise<{aiResponse: string, modelUsed: string}>}
     */
    static async processMessage(userMessage) {
        try {
            const model = getModel();
            const modelConfig = getModelConfig();
            let aiResponse;

            switch (modelConfig.NAME) {
                case 'GEMINI':
                    const result = await model.generateContent(userMessage);
                    const response = await result.response;
                    aiResponse = response.text();
                    break;

                case 'OPENAI':
                    const completion = await model.chat.completions.create({
                        model: modelConfig.model,
                        messages: [{ role: 'user', content: userMessage }]
                    });
                    aiResponse = completion.choices[0].message.content;
                    break;

                case 'CLAUDE':
                    // Claude implementation when available
                    throw new Error('Claude integration not implemented yet');

                default:
                    throw new Error(`Unsupported model: ${modelConfig.NAME}`);
            }

            // Save chat to database
            const chat = new Chat({
                userInput: userMessage,
                aiResponse: aiResponse,
                modelUsed: modelConfig.NAME
            });
            await chat.save();

            return {
                aiResponse,
                modelUsed: modelConfig.NAME
            };
        } catch (error) {
            throw new Error(`Failed to process message: ${error.message}`);
        }
    }

    /**
     * Retrieve chat history with pagination
     * @param {number} page - Page number
     * @param {number} limit - Number of items per page
     * @returns {Promise<{history: Array, pagination: Object}>}
     */
    static async getChatHistory(page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;

            const [history, total] = await Promise.all([
                Chat.find()
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v'),
                Chat.countDocuments()
            ]);

            return {
                history,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    hasMore: skip + history.length < total
                }
            };
        } catch (error) {
            throw new Error(`Failed to retrieve chat history: ${error.message}`);
        }
    }

    /**
     * Delete chat history for a specific timeframe
     * @param {Date} startDate - Start date for deletion
     * @param {Date} endDate - End date for deletion
     * @returns {Promise<{deletedCount: number}>}
     */
    static async deleteChatHistory(startDate, endDate) {
        try {
            const result = await Chat.deleteMany({
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            return {
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw new Error(`Failed to delete chat history: ${error.message}`);
        }
    }

    /**
     * Get chat statistics
     * @returns {Promise<Object>}
     */
    static async getChatStatistics() {
        try {
            const [totalChats, modelUsage, averageResponseTime] = await Promise.all([
                Chat.countDocuments(),
                Chat.aggregate([
                    {
                        $group: {
                            _id: '$modelUsed',
                            count: { $sum: 1 }
                        }
                    }
                ]),
                Chat.aggregate([
                    {
                        $group: {
                            _id: null,
                            avgTime: {
                                $avg: {
                                    $subtract: ['$timestamp', '$timestamp']
                                }
                            }
                        }
                    }
                ])
            ]);

            return {
                totalChats,
                modelUsage: modelUsage.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                averageResponseTime: averageResponseTime[0]?.avgTime || 0
            };
        } catch (error) {
            throw new Error(`Failed to get chat statistics: ${error.message}`);
        }
    }
}

module.exports = ChatService;