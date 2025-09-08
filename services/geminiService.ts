import { GoogleGenAI, Type } from "@google/genai";
import { Message, Difficulty, Feedback, Role } from '../types';
import { getAiSystemPrompt, getFeedbackSystemPrompt, getInstantFeedbackSystemPrompt } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getAiResponse = async (
  history: Message[],
  difficulty: Difficulty
): Promise<string> => {
  try {
    const systemInstruction = getAiSystemPrompt(difficulty);

    const contents = history
      .filter(m => m.role === Role.USER || m.role === Role.AI)
      .map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API call failed in getAiResponse:", error);
    return "I'm having trouble responding right now. Please try again later.";
  }
};

export const getInstantFeedback = async (
  history: Message[],
  flowchart: string[],
  currentStep: number
): Promise<string> => {
    try {
        const systemInstruction = getInstantFeedbackSystemPrompt(flowchart, currentStep);
        const contents = history
            .filter(m => m.role === Role.USER || m.role === Role.AI)
            .map(m => ({
                role: m.role === Role.USER ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));
        
        if (contents.filter(c => c.role === 'user').length === 0) {
            return "Let's begin. Ask the first question from the protocol.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                maxOutputTokens: 60,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Gemini API call failed in getInstantFeedback:", error);
        return "Could not generate feedback at this time.";
    }
};


const feedbackResponseSchema = {
    type: Type.OBJECT,
    properties: {
        flowchartAdherence: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Score 0-100 for flowchart adherence." },
                comment: { type: Type.STRING, description: "Comment on flowchart adherence." },
            },
        },
        focusOnExploitation: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Score 0-100 for focus on exploitation." },
                comment: { type: Type.STRING, description: "Comment on focus on exploitation." },
            },
        },
        victimPerspective: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Score 0-100 for using victim's perspective." },
                comment: { type: Type.STRING, description: "Comment on using victim's perspective." },
            },
        },
        callToAction: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Score 0-100 for the call to action." },
                comment: { type: Type.STRING, description: "Comment on the call to action." },
            },
        },
        overallScore: { type: Type.INTEGER, description: "Average of the four scores." },
        finalVerdict: { type: Type.STRING, description: "A final, one-sentence verdict on the performance." },
    },
};


export const getFeedbackAnalysis = async (
  transcript: Message[],
  flowchart: string[]
): Promise<Feedback> => {
  try {
    const fullTranscript = transcript.map(m => `${m.role}: ${m.content}`).join('\n');
    const systemPrompt = getFeedbackSystemPrompt(flowchart);

    const prompt = `
${systemPrompt}

Conversation Transcript:
---
${fullTranscript}
---

Now, provide your structured feedback as a JSON object.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackResponseSchema,
      },
    });

    let jsonStr = response.text.trim();
    const parsedFeedback = JSON.parse(jsonStr);

    return parsedFeedback as Feedback;
  } catch (error) {
    console.error("Gemini API call failed in getFeedbackAnalysis:", error);
    throw new Error("Failed to generate feedback analysis.");
  }
};