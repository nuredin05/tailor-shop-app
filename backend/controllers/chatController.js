const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatWithAI = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Initialize inside handler to ensure env variables are loaded
  let currentGenAI = null;
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    currentGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  try {
    if (currentGenAI) {
      // Switching to gemini-flash-latest for 2026 API stability
      const model = currentGenAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `You are a helpful customer support assistant for the EUEE Prep Platform. 
      The user says: "${message}"
      Keep your response concise, friendly, and helpful. If you don't know the answer about specific platform details, ask them to contact support@eueeprep.com.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return res.json({ reply: text });
    } else {
      // Fallback response if no API key is provided
      const fallbackReplies = [
        "I'm currently in 'offline mode' because the Gemini API key is missing. How can I help you generally?",
        "That sounds interesting! For specific account issues, please email support@eueeprep.com.",
        "I'm here to help with your EUEE preparation. What subject are you studying today?",
        "Welcome to the EUEE Prep Platform! I can guide you through the dashboard or settings."
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      return res.json({ reply: randomReply });
    }
  } catch (error) {
    console.error("--- Gemini API Error ---");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    if (error.status === 404) {
      console.error("Hint: 404 often means the model name is wrong or the API key doesn't have access to this model.");
    }
    
    res.status(500).json({ 
      error: "AI Service Error", 
      details: error.message,
      reply: "I'm having a technical glitch connecting to my brain. Please try again in a moment!"
    });
  }
};

module.exports = { chatWithAI };
