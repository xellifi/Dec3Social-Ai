
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper to get the client. In a real app, this might use a key from the user's settings
// if they override the env key. For this demo, we prioritize process.env but fallback mock.
const getAiClient = (customKey?: string) => {
  const key = customKey || process.env.API_KEY;
  if (!key) {
    console.warn("No API Key available for Gemini.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const generatePostContent = async (
  topic: string, 
  platform: string, 
  tone: string,
  customKey?: string
): Promise<string> => {
  const ai = getAiClient(customKey);
  if (!ai) return "Error: No API Key provided. Please configure your API key in settings.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a engaging Facebook post about ${topic}. 
      Tone: ${tone}. 
      Platform Context: ${platform} page.
      Keep it under 280 characters if possible, include hashtags.`,
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const generateCaptionFromFormat = async (
  topic: string,
  format: string,
  customKey?: string
): Promise<string> => {
  const ai = getAiClient(customKey);
  if (!ai) return "Error: No API Key.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a Facebook post caption about "${topic}".
      
      CRITICAL INSTRUCTION: You must strictly follow this format structure/style:
      "${format}"
      
      Fill in the text parts relevant to the topic, keep the emojis if they fit the vibe, and use similar hashtag styles.
      Do not output anything else, just the caption.`,
    });
    return response.text || "";
  } catch (error) {
    return "Failed to generate caption.";
  }
};

export const suggestCaptionFormat = async (customKey?: string): Promise<string> => {
  const ai = getAiClient(customKey);
  if (!ai) return "❤️ [Engaging Hook] ✨ \n\n[Short Story/Vibe]\n\n👇 [Call to Action]\n#hashtag #style";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a creative, modern Facebook caption template/format string. 
      It should use emojis, have a structure (like hook, body, CTA), and placeholder hashtags. 
      Make it look aesthetic.
      Example: "✨ [Headline] ✨ \n\n[Body text] \n\n👉 [Question?] \n#tag1 #tag2"
      Return ONLY the template string.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "🌟 [Headline] \n\n[Content] \n\n#hashtag";
  }
};

export const generateReply = async (
  comment: string, 
  instructions: string,
  customKey?: string
): Promise<string> => {
  const ai = getAiClient(customKey);
  if (!ai) return "Thank you for your comment! (Auto-reply)";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are managing a Facebook page. 
      System Instructions: ${instructions}
      
      User Comment: "${comment}"
      
      Write a polite, relevant, and short reply.`,
    });
    return response.text || "Thanks!";
  } catch (error) {
    return "Thank you for reaching out!";
  }
};

export const generateImageContent = async (
  prompt: string,
  referenceImageBase64?: string,
  customKey?: string
): Promise<string | null> => {
  const ai = getAiClient(customKey);
  if (!ai) return null;

  try {
    // Use gemini-2.5-flash-image for image generation and editing tasks
    const model = 'gemini-2.5-flash-image'; 
    const parts: any[] = [];

    if (referenceImageBase64) {
       // Strip data url prefix if present to get raw base64
       const base64Data = referenceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
       parts.push({
        inlineData: {
          mimeType: 'image/png', 
          data: base64Data
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
    });

    // Check for inlineData (image) in response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return null;
  }
};
