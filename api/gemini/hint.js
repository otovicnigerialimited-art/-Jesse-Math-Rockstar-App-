import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { problem, userPrompt, score, username, timestamp, clientSignature } = req.body;

    // Boundary check to stop bot spam from overloading memory
    if (!problem || !userPrompt) {
      return res.status(400).json({ error: 'Missing data.' });
    }
    if (userPrompt.length > 250 || problem.length > 100) {
      return res.status(400).json({ error: 'Input text length limit exceeded.' });
    }

    // Strip angle brackets to stop AI prompt injection breakouts
    const cleanProblem = String(problem).replace(/[<>]/g, '');
    const cleanUserPrompt = String(userPrompt).replace(/[<>]/g, '');

    // Cryptographic leaderboard check to stop score cheating
    if (score !== undefined && clientSignature) {
      const secret = process.env.LEADERBOARD_SECRET || "default_dev_secret_key";
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${username}:${score}:${timestamp}`)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(clientSignature), Buffer.from(expectedSignature))) {
        return res.status(403).json({ error: 'Security validation failed.' });
      }
    }

    // Call Gemini entirely from the hidden server backend
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: "You are a helpful math coach for kids. Only provide hints, never the final answer."
    });

    const secureContextPayload = `<math_data>${cleanProblem}</math_data>\nUser Request: ${cleanUserPrompt}`;
    const result = await model.generateContent(secureContextPayload);
    const response = await result.response;
    
    return res.status(200).json({ success: true, data: response.text() });

  } catch (error) {
    console.error("Internal Security Log:", error.message);
    return res.status(500).json({ error: 'An unexpected processing error occurred.' });
  }
}
