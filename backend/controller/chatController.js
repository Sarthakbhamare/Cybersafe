/**
 * CyberSafe Chatbot Controller
 * Uses Ollama (primary) with Gemini fallback and strict cyber safety constraints
 * Saves chat history per user in MongoDB
 */

import ChatHistory from '../models/ChatHistory.js';

// System prompt to constrain responses to cyber safety topics only
const SYSTEM_PROMPT = `You are CyberSafe Assistant, a cyber safety guide for Indian users.

SCOPE (ONLY answer these topics):
- How to identify scam/phishing red flags
- Safe online practices and digital hygiene
- Password security and 2FA guidance
- How to report cyber crimes in India (cybercrime.gov.in, 1930)
- Protecting personal data and privacy
- Safe banking and UPI practices
- Social engineering awareness
- Device and app security tips

STRICT RULES:
1. NEVER classify or judge if a specific message/URL is "scam" or "safe" - tell users to use the Scam Detector tool
2. NEVER answer questions unrelated to cyber safety (coding, math, general knowledge, recipes, etc.)
3. Keep answers concise (2-4 short paragraphs max, use bullet points)
4. Be helpful and actionable with practical tips
5. If asked to classify a message, say: "I can't classify specific messages. Please use our Scam Detector tool for that. Here are general red flags to watch for..."
6. For off-topic questions, say: "I'm specialized in cyber safety topics only. I can help with online security, scam awareness, and safe digital practices. Please ask about those!"
7. Always mention cybercrime.gov.in or 1930 helpline when discussing reporting
8. Use simple English, avoid jargon`;

const DEFAULT_PROVIDER_ORDER = ['ollama', 'gemini'];

const getProviderOrder = () => {
  const raw = process.env.CHAT_PROVIDER_ORDER;
  if (!raw) return DEFAULT_PROVIDER_ORDER;
  const providers = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return providers.length ? providers : DEFAULT_PROVIDER_ORDER;
};

const callGemini = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY not configured');
    err.code = 'CONFIG';
    throw err;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nUser question: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error?.message || 'Gemini request failed');
    err.status = response.status;
    err.details = errorData;
    throw err;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  return text;
};

const callOllama = async (message) => {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error || 'Ollama request failed');
    err.status = response.status;
    err.details = errorData;
    throw err;
  }

  const data = await response.json();
  const text = data.message?.content || data.response;
  if (!text) {
    throw new Error('Empty response from Ollama');
  }
  return text;
};

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id; // From auth middleware
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    
    if (!trimmedMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const providers = getProviderOrder();
    const handlerByProvider = {
      ollama: callOllama,
      gemini: callGemini,
    };

    let lastError = null;
    let geminiRateLimited = false;
    let text = null;

    for (const provider of providers) {
      const handler = handlerByProvider[provider];
      if (!handler) continue;

      try {
        text = await handler(trimmedMessage);
        break;
      } catch (error) {
        lastError = error;
        if (provider === 'gemini' && error?.status === 429) {
          geminiRateLimited = true;
        }
        console.error(`Chat provider ${provider} failed:`, error);
      }
    }

    if (!text) {
      if (geminiRateLimited) {
        return res.json({
          response: `I'm temporarily unavailable due to high demand. Here are quick cyber safety tips:\n\n**Strong Passwords:** Use 12+ characters with uppercase, lowercase, numbers, and symbols. Never reuse passwords.\n\n**Avoid Phishing:** Don't click suspicious links. Check sender email addresses carefully.\n\n**Enable 2FA:** Turn on two-factor authentication for all important accounts.\n\n**Report Scams:** File complaints at cybercrime.gov.in or call 1930.\n\nPlease try again in a minute for personalized answers!`,
          timestamp: new Date().toISOString(),
          fallback: true
        });
      }

      return res.status(500).json({
        error: 'Failed to get response from AI',
        details: lastError?.message || 'Unknown error'
      });
    }

    // Save chat history if user is authenticated
    if (userId) {
      try {
        let chatHistory = await ChatHistory.findOne({ userId });
        if (!chatHistory) {
          chatHistory = new ChatHistory({ userId, messages: [] });
        }
        
        // Add user message and assistant response
        chatHistory.messages.push(
          { role: 'user', content: trimmedMessage },
          { role: 'assistant', content: text }
        );
        
        // Keep only last 50 messages to prevent unlimited growth
        if (chatHistory.messages.length > 50) {
          chatHistory.messages = chatHistory.messages.slice(-50);
        }
        
        await chatHistory.save();
      } catch (historyError) {
        console.error('Error saving chat history:', historyError);
        // Don't fail the request if history save fails
      }
    }

    res.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat service error',
      message: error.message 
    });
  }
};

// Get chat history for the logged in user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chatHistory = await ChatHistory.findOne({ userId });
    res.json({ 
      messages: chatHistory?.messages || [],
      updatedAt: chatHistory?.updatedAt || null
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Clear chat history for the logged in user
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await ChatHistory.findOneAndDelete({ userId });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
