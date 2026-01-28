import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    // Check if prompt is valid
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    // Generate image with fallback to DALL·E 2
    const aiResponse = await openai.images.generate({
      model: 'dall-e-2', // Only use 'dall-e-3' if you're sure your API key supports it
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const image = aiResponse.data[0]?.b64_json;

    if (!image) {
      return res.status(500).json({ error: 'Failed to generate image. Empty response.' });
    }

    res.status(200).json({ photo: image });

  } catch (error) {
    console.error('DALL-E Error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Image generation failed. Please check your prompt and try again.' });
  }
});

export default router;
