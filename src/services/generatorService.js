const { getModel, setModel, getModelConfig } = require('../models/models');

class GeneratorService {
    static async generateKeywords(topic) {
        try {
            const model = getModel();
            const prompt = `Generate 10 relevant SEO keywords for the topic: ${topic}. 
                            Also give me the score of how much the keyword is relevant to the topic.
                           Return only a JSON array of objects with "keyword" and "relevance" fields, without any markdown formatting or additional text.`;
    
            let result;
            if (getModelConfig().NAME === 'Gemini') {
                result = await model.generateContent(prompt);
                const cleanResponse = result.response.text().replace(/```json\n|\n```/g, '').trim();
                return JSON.parse(cleanResponse); // Parse JSON string to object
            } else if (getModelConfig().NAME === 'OpenAI') {
                result = await model.chat.completions.create({
                    model: getModelConfig().model,
                    messages: [{ role: 'user', content: prompt }],
                });
                return JSON.parse(result.choices[0].message.content); // Parse JSON string to object
            } else {
                throw new Error('Model not supported for keyword generation.');
            }
        } catch (error) {
            throw new Error(`Failed to generate keywords: ${error.message}`);
        }
    }

    static async generateTitle(topic) {
        try {
            const model = getModel();
            const prompt = `Generate 1 engaging title for the topic: ${topic}. 
                           The title should be very attractive and under 60 characters. 
                           Return only a html object inside a JSON array of strings, without any markdown formatting or additional text.`;

            let result;
            if (getModelConfig().NAME === 'Gemini') {
                result = await model.generateContent(prompt);
                const cleanResponse = result.response.text().replace(/```json\n|\n```/g, '').trim();
                return JSON.parse(cleanResponse); // Parses the JSON string to object
            } else if (getModelConfig().NAME === 'OpenAI') {
                result = await model.chat.completions.create({
                    model: getModelConfig().model,
                    messages: [{ role: 'user', content: prompt }],
                });
                return JSON.parse(result.choices[0].message.content); // Parses the JSON string to object
            } else {
                throw new Error('Model not supported for title generation.');
            }
        } catch (error) {
            throw new Error(`Failed to generate title: ${error.message}`);
        }
    }

    static async generateMeta(topic) {
        try {
            const model = getModel();
            const prompt = `Generate meta description for the topic: ${topic}. 
                           The description should be under 160 characters and SEO optimized. 
                           Return only a html object inside a JSON object with a single "description" field, without any markdown formatting or additional text.`;

            let result;
            if (getModelConfig().NAME === 'Gemini') {
                result = await model.generateContent(prompt);
                const cleanResponse = result.response.text().replace(/```json\n|\n```/g, '').trim();
                return JSON.parse(cleanResponse); // Parses the string to object
            } else if (getModelConfig().NAME === 'OpenAI') {
                result = await model.chat.completions.create({
                    model: getModelConfig().model,
                    messages: [{ role: 'user', content: prompt }],
                });
                return JSON.parse(result.choices[0].message.content); //Parses the JSON string to object
            } else {
                throw new Error('Model not supported for meta generation.');
            }
        } catch (error) {
            throw new Error(`Failed to generate meta: ${error.message}`);
        }
    }

    static async generateContent(topic) {
        try {
            const model = getModel();
            const prompt = `Generate a detailed article about: ${topic}. 
                           Include introduction, main points, and conclusion.
                           Return only a html object inside a JSON array of strings, without any markdown formatting or additional text.`;

            let result;
            if (getModelConfig().NAME === 'Gemini') {
                result = await model.generateContent(prompt);
                return result.response.text();
            } else if (getModelConfig().NAME === 'OpenAI') {
                result = await model.chat.completions.create({
                    model: getModelConfig().model,
                    messages: [{ role: 'user', content: prompt }],
                });
                return result.choices[0].message.content;// raw text content
            } else {
                throw new Error('Model not supported for content generation.');
            }
        } catch (error) {
            throw new Error(`Failed to generate content: ${error.message}`);
        }
    }

    static async generateAllContent(topic, selectedKeywords = []) {
        try {
            const [keywords, titles, meta, content] = await Promise.all([
                this.generateKeywords(topic),
                this.generateTitle(topic),
                this.generateMeta(topic),
                this.generateContent(topic)
            ]);

            // Filters keywords if selectedKeywords are provided by the user
            const filteredKeywords = selectedKeywords.length > 0
                ? keywords.filter(k => selectedKeywords.includes(k.keyword))
                : keywords;

            return {
                keywords: filteredKeywords,
                titles,
                meta,
                content
            };
        } catch (error) {
            throw new Error(`Failed to generate all content: ${error.message}`);
        }
    }

    static async switchModel(model) {
        try {
            const result = setModel(model);
            return result;
        } catch (error) {
            throw new Error(`Failed to switch model: ${error.message}`);
        }
    }
}

module.exports = GeneratorService;