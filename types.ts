export interface LanguageOption {
  code: string;
  name: string;
}

export type BookStructure = Record<string, string | Record<string, string>>;

export interface ChapterTask {
  id: string; 
  title: string;
  // This description will hold the direct string value if the section is simple,
  // or a JSON.stringify-ed version of the sub-structure if it's a complex section.
  // It's used as 'chapterOutlineJson' in the content prompt.
  description: string; 
  path: string[]; // e.g. ["Chapter 1"] (will always be a single top-level item now)
  status: 'pending' | 'generating' | 'done' | 'error';
  content?: string;
  errorMessage?: string;
}

export type GenerationMode = 'normal' | 'advanced';

// Removed ContentLength and ReadingLevel string enums
// export type ContentLength = 'short' | 'medium' | 'long';
// export type ReadingLevel = 'simple' | 'standard' | 'advanced';

export interface UserInputs {
  subject: string;
  language: string;
  additionalInfo: string;
  generationMode: GenerationMode;
  contentLength: number; // Changed to number
  readingLevel: number; // Changed to number
  numberOfChapters: number; 
}

export enum AppStep {
  USER_INPUT,
  GENERATING_OUTLINE,
  OUTLINE_REVIEW,
  GENERATING_CHAPTERS,
  VIEW_BOOK,
}