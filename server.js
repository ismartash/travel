const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate itinerary endpoint
app.post('/generate-itinerary', async (req, res) => {
    const { city, interests } = req.body;

    if (!city || !interests) {
        return res.status(400).json({ error: 'City and interests are required' });
    }

    try {
        const prompt = `Create a detailed day trip itinerary for ${city} focusing on these interests: ${interests}. 
        Please include:
        - A morning, afternoon, and evening schedule
        - Specific locations and attractions
        - Approximate time spent at each location
        - Transportation suggestions between locations
        - Local food and restaurant recommendations
        - Tips for the best experience
        
        Format the itinerary in a clear, easy-to-read way with times and descriptions.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const itinerary = response.text();

        res.json({ itinerary });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate itinerary',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});