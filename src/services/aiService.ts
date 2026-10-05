/**
 * Optional AI writing helpers (titles and excerpts).
 *
 * Enabled only when VITE_HUGGINGFACE_API_KEY is set. The key is embedded in
 * the browser bundle, so use a narrowly scoped token. Requests go to Hugging
 * Face's OpenAI-compatible router.
 */
const API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL = import.meta.env.VITE_HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct";
const API_KEY: string = import.meta.env.VITE_HUGGINGFACE_API_KEY || "";

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

const complete = async (prompt: string, maxTokens: number): Promise<string> => {
  if (!API_KEY) throw new Error("The AI assistant isn't configured.");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`The AI service returned an error (${response.status}).`);
  }
  const data = (await response.json()) as ChatResponse;
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI service returned an empty answer.");
  return text;
};

export const aiService = {
  isConfigured: Boolean(API_KEY),

  async suggestTitles(title: string, text: string): Promise<string[]> {
    const answer = await complete(
      `Suggest 5 concise, engaging blog post titles (max 70 characters each) for this article. ` +
        `Reply with one title per line and nothing else.\n\nCurrent title: ${title || "(none)"}\n\n` +
        `Article:\n${text.slice(0, 4000)}`,
      200
    );
    return answer
      .split("\n")
      .map((line) => line.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").replace(/^"|"$/g, "").trim())
      .filter((line) => line.length > 3)
      .slice(0, 5);
  },

  async suggestExcerpt(title: string, text: string): Promise<string> {
    const answer = await complete(
      `Write a 1–2 sentence summary (max 200 characters) of this blog post for a post listing. ` +
        `Reply with the summary only.\n\nTitle: ${title}\n\nArticle:\n${text.slice(0, 4000)}`,
      120
    );
    return answer.replace(/^"|"$/g, "").slice(0, 220);
  },
};
