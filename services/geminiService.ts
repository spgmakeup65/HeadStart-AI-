
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BookSummary, GrowthPlan, HistoricalFigure, Course } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBookSummary = async (bookTitle: string): Promise<BookSummary> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Resume el libro "${bookTitle}" en un formato de 15 minutos. Céntrate en ideas de autoayuda, negocios o disciplina. RESPONDE ÚNICAMENTE EN ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          keyInsights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Los 5 puntos o ideas más accionables."
          },
          mainTakeaway: { type: Type.STRING },
          readingTime: { type: Type.NUMBER }
        },
        required: ["id", "title", "author", "keyInsights", "mainTakeaway", "readingTime"]
      }
    }
  });

  const summary = JSON.parse(response.text || '{}');
  if (!summary.id) summary.id = Math.random().toString(36).substr(2, 9);
  return summary;
};

export const generateHistoricalFigure = async (characterName: string): Promise<HistoricalFigure> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera una ficha de mentoría basada en el personaje histórico: "${characterName}". Extrae sus principios de vida y legado. RESPONDE ÚNICAMENTE EN ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          title: { type: Type.STRING },
          period: { type: Type.STRING },
          legacy: { type: Type.STRING },
          corePrinciples: { type: Type.ARRAY, items: { type: Type.STRING } },
          famousQuote: { type: Type.STRING }
        },
        required: ["name", "title", "period", "legacy", "corePrinciples", "famousQuote"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateCourse = async (topic: string): Promise<Course> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crea un micro-curso estructurado sobre el tema: "${topic}". Debe tener entre 3 y 5 módulos educativos. RESPONDE ÚNICAMENTE EN ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          objective: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["title", "content", "duration"]
            }
          }
        },
        required: ["id", "title", "objective", "totalDuration", "modules"]
      }
    }
  });
  const course = JSON.parse(response.text || '{}');
  if (!course.id) course.id = Math.random().toString(36).substr(2, 9);
  return course;
};

export const getBooksByTopic = async (topic: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Lista 5 libros de no ficción populares y altamente recomendados sobre el tema: "${topic}". Solo devuelve los títulos. RESPONDE EN ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateGrowthPlan = async (interests: string[]): Promise<GrowthPlan> => {
  const interestsList = interests.join(", ");
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crea un plan de crecimiento personal y un "Reto del Día" basado en: ${interestsList}. RESPONDE ÚNICAMENTE EN ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyFocus: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["title", "description", "duration"]
            }
          },
          challenge: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              action: { type: Type.STRING },
              benefit: { type: Type.STRING }
            },
            required: ["title", "action", "benefit"]
          },
          suggestedBooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["dailyFocus", "steps", "challenge", "suggestedBooks"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const speakText = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Lee esto con voz inspiradora y clara: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No se pudo generar audio");
  return base64Audio;
};
