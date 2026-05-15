const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct listModels in the client SDK like this usually, 
    // but we can try to hit a known simple model.
    console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash");
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("test");
      console.log("Success with gemini-pro");
    } catch (err) {
      console.error("Error with gemini-pro:", err.message);
    }
  }
}

listModels();
