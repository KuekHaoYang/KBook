import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserInputs, BookStructure, GenerationMode } from '../types'; 
import { 
  GEMINI_FLASH_MODEL_NORMAL,
  GEMINI_PRO_MODEL_ADVANCED,
  STRUCTURE_PROMPT_TEMPLATE,
  TITLE_PROMPT_TEMPLATE,
  CONTENT_PROMPT_TEMPLATE
} from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Application functionality will be impaired or fail.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY }); 

const getModelId = (mode: GenerationMode): string => {
  return mode === 'advanced' ? GEMINI_PRO_MODEL_ADVANCED : GEMINI_FLASH_MODEL_NORMAL;
};

export const parseJsonFromText = (text: string): any => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    throw new Error("Invalid JSON response from AI. The AI returned content that was not valid JSON.");
  }
};

export const generateBookStructureStream = async (inputs: UserInputs): Promise<AsyncIterable<GenerateContentResponse>> => {
  const prompt = STRUCTURE_PROMPT_TEMPLATE
    .replace(/\$\{language\}/g, inputs.language)
    .replace(/\$\{subject\}/g, inputs.subject)
    .replace(/\$\{additionalInfo\}/g, inputs.additionalInfo || "None")
    .replace(/\$\{numberOfChapters\}/g, inputs.numberOfChapters.toString());

  return ai.models.generateContentStream({
    model: getModelId(inputs.generationMode),
    contents: prompt,
  });
};

export const generateBookTitle = async (inputs: UserInputs, bookStructure: BookStructure): Promise<string> => {
  const prompt = TITLE_PROMPT_TEMPLATE
    .replace(/\$\{language\}/g, inputs.language)
    .replace(/\$\{subject\}/g, inputs.subject)
    .replace(/\$\{additionalInfo\}/g, inputs.additionalInfo || "None")
    .replace(/\$\{bookStructure\}/g, JSON.stringify(bookStructure, null, 2));
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: getModelId(inputs.generationMode),
    contents: prompt,
  });
  return response.text.trim();
};

export const generateChapterContentStream = async (
  inputs: UserInputs,
  chapterTitle: string,
  chapterOutlineJson: string, 
  fullBookStructureJson: string, 
  previouslyGeneratedChaptersContent: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const prompt = CONTENT_PROMPT_TEMPLATE
    .replace(/\$\{language\}/g, inputs.language)
    .replace(/\$\{overallBookSubject\}/g, inputs.subject)
    .replace(/\$\{additionalInfo\}/g, inputs.additionalInfo || "None")
    .replace(/\$\{chapterTitle\}/g, chapterTitle)
    .replace(/\$\{chapterOutlineJson\}/g, chapterOutlineJson)
    .replace(/\$\{fullBookStructureJson\}/g, fullBookStructureJson)
    .replace(/\$\{previouslyGeneratedChaptersContent\}/g, previouslyGeneratedChaptersContent || "No chapters written yet.")
    .replace(/\$\{contentLength\}/g, inputs.contentLength.toString())
    .replace(/\$\{readingLevel\}/g, inputs.readingLevel.toString());
    
  return ai.models.generateContentStream({
    model: getModelId(inputs.generationMode),
    contents: prompt,
  });
};