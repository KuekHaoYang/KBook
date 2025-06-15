import { LanguageOption } from './types';

export const GEMINI_FLASH_MODEL_NORMAL = 'gemini-2.5-flash-preview-05-20';
export const GEMINI_PRO_MODEL_ADVANCED = 'gemini-2.5-pro-preview-06-05';


export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

export const STRUCTURE_PROMPT_TEMPLATE = `
Write in JSON format. The entire response MUST be a single, complete, and valid JSON object. Ensure all brackets and braces are correctly matched and commas are placed appropriately according to JSON syntax rules. Do not include any text or explanation outside of this single JSON object.

The book structure should consist of exactly \${numberOfChapters} main top-level sections. Each main top-level section you define will become a chapter in the book. Do not create more or fewer than this specified number of main sections.

Example JSON structure for a request of 2 chapters:
{"Title of main section 1":"Description of main section 1",
 "Title of main section 2":{"Title of sub-section A for section 2":"Description of sub-section A for section 2","Title of sub-section B for section 2":"Description of sub-section B for section 2"}}

Now, write a comprehensive structure for a book with exactly \${numberOfChapters} main top-level sections. Omit introduction and conclusion sections (e.g., forward, author's note, summary). Only provide up to one level of depth for nested sections (main sections can have sub-sections, but sub-sections cannot have further sub-sub-sections). Make clear titles and descriptions for all sections, ensuring they cover the subject comprehensively and have no overlap.

Please write the output in this language: \${language}.

<subject>\${subject}</subject>

Additional Instructions:
\${additionalInfo}
`;

export const TITLE_PROMPT_TEMPLATE = `
Generate a suitable book title for the provided topic and book structure. There is only one generated book title! Do not give any explanation or add any symbols, just write the title of the book. The requirement for this title is that it must be between 7 and 25 words long, and it must be attractive enough!

Please write the output in this language: \${language}.

<subject>\${subject}</subject>

<book_structure>
\${bookStructure}
</book_structure>

Additional Instructions:
\${additionalInfo}
`;

export const CONTENT_PROMPT_TEMPLATE = `
You are an expert writer. Your task is to generate a comprehensive, structured chapter based on the provided details.
IMPORTANT: Only output the raw text content for the chapter. Do NOT include any introductory phrases (e.g., "Here is the chapter...", "Okay, I will write..."), conversational remarks, or any text other than the chapter content itself. The output should be ready to be directly inserted into a book.

Adhere to the following parameters for the chapter:
Target approximate word count: \${contentLength} words.
Target reading complexity on a scale of 1 to 10 (1=simplest, 10=most advanced): \${readingLevel}.

Use the following information to generate the chapter:
Language: \${language}
Overall Book Subject: \${overallBookSubject}
Additional Instructions for the book (if any): \${additionalInfo}

Current Chapter to Write:
Chapter Title: \${chapterTitle}
Chapter Outline (this includes the main description and any sub-sections for THIS chapter):
\${chapterOutlineJson}

Full Book Outline (for overall context and to understand the placement of this chapter):
\${fullBookStructureJson}

Previously Written Chapters (for context and continuity; content appears after "---END OF PREVIOUS CHAPTER---" marker):
\${previouslyGeneratedChaptersContent}
---END OF PREVIOUS CHAPTER---
`;