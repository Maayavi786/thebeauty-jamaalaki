// Utility to call Groq API for LLM chat (e.g., llama3-70b-8192)
// The API key should be set in .env as VITE_GROQ_API_KEY

interface ChatMessage {
  role: string;
  content: string;
}

// Initial context to help AI understand the application
const SYSTEM_PROMPT = {
  role: "system",
  content: `You are a helpful, friendly beauty salon assistant for The Beauty application. 
You provide information about salon services, beauty tips, and assist with booking questions.
You give concise, helpful answers and speak in a warm, approachable tone.
When uncertain about specific salon details or bookings, suggest the user visit the salon details page or contact the salon directly.

For Arabic users, respond in fluent Arabic with proper grammar and terminology related to beauty salons.`
};

// Maximum retries for API calls
const MAX_RETRIES = 2;

/**
 * Fetch a response from the Groq API
 * 
 * @param messages User-AI conversation history
 * @returns AI response or error message
 */
export async function fetchGroqResponse(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  // Check for API key
  if (!apiKey) {
    console.error("Groq API key is missing");
    return "[Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.]";
  }
  
  // Add system prompt as first message if not already present
  const fullMessages = messages[0]?.role === "system" ? 
    messages : 
    [SYSTEM_PROMPT, ...messages];
  
  // Format messages for the API
  const formattedMessages = fullMessages.map(m => ({
    role: m.role === "user" ? "user" : m.role === "system" ? "system" : "assistant",
    content: m.content,
  }));
  
  // Function to attempt the API call with retries
  const attemptAPICall = async (retryCount: number): Promise<string> => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API Error (${response.status}):`, errorText);
        
        // Check if we should retry
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying Groq API call (${retryCount + 1}/${MAX_RETRIES})`);
          return attemptAPICall(retryCount + 1);
        }
        
        return `[Sorry, I'm having trouble connecting to my brain. Please try again later.]`;
      }
      
      // Parse and return the response
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "[No response content was generated. Please try again.]";
      
    } catch (error) {
      console.error("Groq API call failed:", error);
      
      // Check if we should retry
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying Groq API call (${retryCount + 1}/${MAX_RETRIES})`);
        return attemptAPICall(retryCount + 1);
      }
      
      return "[Sorry, there was a problem connecting to the AI service. Please try again later.]";
    }
  };
  
  // Start the API call attempt
  return attemptAPICall(0);
}
