// Utility to call OpenAI's ChatGPT API from the browser
// The API key should be set in .env as VITE_OPENAI_API_KEY

export async function fetchChatGPTResponse(messages: {role: string, content: string}[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return "[OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.]";
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    return `[OpenAI API Error: ${response.status}]`;
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "[No response from OpenAI]";
}
