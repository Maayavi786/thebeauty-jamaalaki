// Utility to call Google Gemini Pro API from the browser
// The API key should be set in .env as VITE_GEMINI_API_KEY

export async function fetchGeminiResponse(messages: {role: string, content: string}[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return "[Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.]";
  }
  // Gemini expects each message as a separate part
  const parts = messages.map(m => ({
    text: m.content
  }));
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );
  if (!response.ok) {
    return `[Gemini API Error: ${response.status}]`;
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[No response from Gemini]";
}
