
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { AiResponse, DebugInfo, BubbleColor } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

export interface TargetCandidate {
  id: string;
  color: BubbleColor;
  size: number;
  row: number;
  col: number;
  pointsPerBubble: number;
  description: string;
}

export const getOracleAdvice = async (
  history: string[],
  umbraHp: number,
  elementalBalance: any
): Promise<AiResponse> => {
  const startTime = performance.now();
  
  const prompt = `
    You are the "Chromatic Oracle" in an Arcade RPG called Color Game Royale.
    The game is based on the traditional Filipino "Color Game" where 3 dice are rolled.
    
    CURRENT STATE:
    - Recent Rolls (History): ${history.slice(-10).join(', ')}
    - Boss HP (Umbra): ${umbraHp}
    - Elemental Balance: ${JSON.stringify(elementalBalance)}
    
    FACTIONS:
    - Red (Fire): Aggressive damage to Umbra.
    - Blue (Water): Time bonuses.
    - Green (Nature): Point multipliers.
    - Yellow/White (Light): Score double-up.

    TASK:
    Analyze the luck patterns (pseudo-randomly) and the RPG state. 
    Provide a "Prophecy" for the next roll.
    
    OUTPUT FORMAT (JSON):
    {
      "message": "A mystical, arcade-style prophecy.",
      "rationale": "Strategic reason based on Umbra's health or recent patterns.",
      "recommendedColor": "red|blue|green|yellow|white",
      "dangerLevel": "Low|Medium|High"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const endTime = performance.now();
    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      hint: json,
      debug: { latency: Math.round(endTime - startTime), raw: text }
    };
  } catch (error) {
    return {
      hint: {
        message: "The mists are thick... Trust your instincts.",
        rationale: "Connection to the Chromatic Kingdom is weak.",
        recommendedColor: "red",
        dangerLevel: "Medium"
      },
      debug: error
    };
  }
};

// Added getStrategicHint for Slingshot game analysis
export const getStrategicHint = async (
  screenshot: string,
  targets: TargetCandidate[],
  maxRow: number
): Promise<{ hint: any; debug: DebugInfo }> => {
  const startTime = performance.now();
  // Strip data URL prefix if present
  const base64Data = screenshot.includes(',') ? screenshot.split(',')[1] : screenshot;
  
  const prompt = `
    Analyze this bubble shooter game state. 
    REACHABLE CLUSTERS: ${JSON.stringify(targets)}
    LOWEST BUBBLE ROW: ${maxRow}
    
    TASK:
    Identify the most strategic cluster to hit. 
    Prioritize:
    1. Large clusters (matches of 3+).
    2. Higher points colors.
    3. Lower clusters that are closer to the slingshot.
    
    Return the best target's row/col and the recommended color to use.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            rationale: { type: Type.STRING },
            targetRow: { type: Type.NUMBER },
            targetCol: { type: Type.NUMBER },
            recommendedColor: { type: Type.STRING, description: "red|blue|green|yellow|purple|orange" }
          },
          required: ["message", "rationale", "targetRow", "targetCol", "recommendedColor"]
        }
      }
    });

    const endTime = performance.now();
    const text = response.text || "{}";
    let json = {};
    let parseError = undefined;
    try {
        json = JSON.parse(text);
    } catch (e) {
        parseError = String(e);
    }

    return {
      hint: json,
      debug: { 
        latency: Math.round(endTime - startTime), 
        rawResponse: text,
        parsedResponse: json,
        screenshotBase64: screenshot,
        promptContext: prompt,
        error: parseError
      }
    };
  } catch (error) {
    return {
      hint: {
        message: "The trajectory is unclear.",
        rationale: "Analysis engine encountered an error.",
        targetRow: 0,
        targetCol: 0,
        recommendedColor: "red"
      },
      debug: {
        latency: 0,
        rawResponse: String(error),
        parsedResponse: null,
        error: String(error)
      }
    };
  }
};
