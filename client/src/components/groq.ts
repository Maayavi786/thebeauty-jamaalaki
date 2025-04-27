// Utility to call Groq API for LLM chat (e.g., llama3-70b-8192)
// The API key should be set in .env as VITE_GROQ_API_KEY

export async function fetchGroqResponse(messages: {role: string, content: string}[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return "[Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.]";
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    return `[Groq API Error: ${response.status}]`;
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "[No response from Groq]";
}
