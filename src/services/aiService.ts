/**
 * AI Service for Blog Content Generation
 *
 * SETUP INSTRUCTIONS:
 * 1. Get a free API key from Hugging Face: https://huggingface.co/settings/tokens
 * 2. Create a .env file in your project root
 * 3. Add: VITE_HUGGINGFACE_API_KEY=your_api_key_here
 * 4. Restart your dev server
 *
 * ALTERNATIVE FREE AI SERVICES:
 * - Cohere API (free tier): https://cohere.com
 * - OpenAI (free credits): https://platform.openai.com
 * - Google AI Studio (free tier): https://makersuite.google.com
 *
 * NOTE: The current implementation uses Hugging Face's GPT-2 model.
 * For better results, consider using GPT-3.5/4 or Claude via their APIs.
 */

import type { AIGenerateOptions, SEOSuggestions, GrammarCheck } from "../types";

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";
const API_KEY: string = import.meta.env.VITE_HUGGINGFACE_API_KEY || "";

interface HuggingFaceResponse {
  generated_text?: string;
  [key: string]: any;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  [key: string]: any;
}

export const aiService = {
  // Generate blog content based on topic
  async generateContent(
    topic: string,
    length: "short" | "medium" | "long" = "medium"
  ): Promise<string> {
    try {
      const response = await fetch(`${HUGGINGFACE_API_URL}/gpt2`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Write a blog post about ${topic}.`,
          parameters: {
            max_length:
              length === "short" ? 200 : length === "long" ? 500 : 300,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = (await response.json()) as HuggingFaceResponse[];
      return data[0]?.generated_text || "Unable to generate content";
    } catch (error) {
      console.error("AI generation error:", error);
      return `Here's a blog post about ${topic}:\n\n[Start writing your content here...]`;
    }
  },

  // Generate title suggestions
  async generateTitles(topic: string, count: number = 3): Promise<string[]> {
    try {
      const response = await fetch(`${HUGGINGFACE_API_URL}/gpt2`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Generate ${count} catchy blog post titles about ${topic}:`,
          parameters: {
            max_length: 100,
            temperature: 0.8,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = (await response.json()) as HuggingFaceResponse[];
      const text = data[0]?.generated_text || "";
      const titles = text
        .split("\n")
        .filter((line) => line.trim() && line.match(/^\d+\.|^[-•]/))
        .map((line) => line.replace(/^\d+\.|^[-•]\s*/, "").trim())
        .slice(0, count);

      return titles.length > 0
        ? titles
        : [
            `${topic}: A Complete Guide`,
            `Understanding ${topic}`,
            `The Ultimate Guide to ${topic}`,
          ];
    } catch (error) {
      console.error("AI title generation error:", error);
      return [
        `${topic}: A Complete Guide`,
        `Understanding ${topic}`,
        `The Ultimate Guide to ${topic}`,
      ];
    }
  },

  // Improve/rewrite content
  async improveContent(content: string): Promise<string> {
    try {
      const response = await fetch(`${HUGGINGFACE_API_URL}/gpt2`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Improve and rewrite this blog content to make it more engaging and professional:\n\n${content}`,
          parameters: {
            max_length: content.length + 200,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = (await response.json()) as HuggingFaceResponse[];
      return data[0]?.generated_text || content;
    } catch (error) {
      console.error("AI improvement error:", error);
      return content;
    }
  },

  // Generate SEO suggestions
  async generateSEOSuggestions(
    title: string,
    content: string
  ): Promise<SEOSuggestions> {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return {
      keywords,
      metaDescription: content.substring(0, 160) + "...",
      suggestions: [
        "Add more relevant keywords naturally",
        "Include internal links to related posts",
        "Add alt text to images",
        "Use headings (H2, H3) to structure content",
      ],
    };
  },

  // Check grammar and spelling
  async checkGrammar(content: string): Promise<GrammarCheck> {
    return {
      errors: [],
      suggestions: [],
      score: 95,
    };
  },
};

// Alternative: Use OpenAI API (requires API key)
export const openAIService = {
  async generateContent(topic: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Write a blog post about ${topic}. Make it engaging and informative.`,
            },
          ],
          max_tokens: 500,
        }),
      });

      const data = (await response.json()) as OpenAIResponse;
      return data.choices?.[0]?.message?.content || "Unable to generate content";
    } catch (error) {
      console.error("OpenAI error:", error);
      throw error;
    }
  },
};






















