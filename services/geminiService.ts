
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeRoutine } from "../types";

export const generateRoutine = async (focusArea: string): Promise<PracticeRoutine> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a professional, high-performance billiards/pool practice routine focusing on: ${focusArea}. 
    Provide the result as a JSON object with a title, short description, and an array of 3 technical drills.
    For each drill, include:
    1. name: A professional name for the drill.
    2. reps: Specific repetitions or time (e.g., '15 successful shots' or '10 minutes').
    3. instructions: Detailed technical steps. Focus on cue action, stance, and aiming.
    4. youtubeSearchQuery: A precise search string for a tutorial video (e.g., "dr. dave pool ${focusArea} drill").`,
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
                youtubeSearchQuery: { type: Type.STRING },
              },
              required: ["name", "reps", "instructions", "youtubeSearchQuery"]
            }
          }
        },
        required: ["title", "description", "drills"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as PracticeRoutine;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not generate your routine. Please try again.");
  }
};

export const analyzeFormVideo = async (base64Video: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are a world-class professional billiards coach and biomechanics expert. 
  Analyze this video of a player's stroke and form with extreme technical precision.
  
  Analyze the following specific areas:
  1. **Stance & Balance**: Check foot positioning and head alignment over the cue.
  2. **Bridge Stability**: Is the bridge hand solid? Is there any movement during the shot?
  3. **Stroke Quality**: Analyze the backswing length, the pause at the back, and the follow-through acceleration.
  4. **Recommendations**: Provide 3 specific, actionable corrections to improve consistency.
  
  Use professional terminology. Format with clear markdown headers (###) and bullet points.`;

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
    config: {
      // Adding thinking budget to allow the model to process physics and motion more deeply
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text || "I couldn't analyze the video. Please ensure the camera is steady and try again.";
};