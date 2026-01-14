
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeRoutine } from "../types";

export const generateRoutine = async (focusArea: string): Promise<PracticeRoutine> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a professional billiards/pool practice routine focusing on: ${focusArea}. Provide the result as a JSON object with a title, short description, and an array of 3 drills, each with a name, reps/duration, and clear instructions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          drills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reps: { type: Type.STRING },
                instructions: { type: Type.STRING },
              },
              required: ["name", "reps", "instructions"]
            }
          }
        },
        required: ["title", "description", "drills"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data as PracticeRoutine;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not generate your routine. Please try again.");
  }
};

export const generateDrillImage = async (drillName: string, instructions: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A professional 3D top-down diagram of a billiards table showing a specific drill called "${drillName}". Instructions: ${instructions}. The image should be clean, instructional, with a premium aesthetic, showing the green felt of a pool table, balls in specific positions, and white arrow paths showing cue ball movement. High quality, 4k, realistic textures.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data returned");
};

export const analyzeFormVideo = async (base64Video: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are a world-class professional billiards coach. Analyze this video of a player's stroke and form. Provide a detailed, professional critique covering: 1. Stance & Balance, 2. Bridge Stability, 3. Stroke Quality (backswing, pause, follow-through), and 4. Specific recommendations for improvement. Be encouraging but technically precise. Format the output with clear headers and bullet points. Use professional terminology (e.g., 'cue action', 'follow-through', 'grip tension').`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Video,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  return response.text || "I couldn't analyze the video. Please try again with a clearer angle.";
};
