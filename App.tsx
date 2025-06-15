import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserInputs, BookStructure, ChapterTask, AppStep } from './types';
import * as geminiService from './services/geminiService';
import UserInputPane from './components/UserInputPane';
import OutlineReviewPane from './components/OutlineReviewPane';
import ChapterGenerationPane from './components/ChapterGenerationPane';
import BookViewPane from './components/BookViewPane';
import ProgressBar from './components/ProgressBar';
import LoadingIndicator from './components/LoadingIndicator';
import DetailedCustomizationModal from './components/DetailedCustomizationModal'; // Though not directly used here, its types are part of UserInputPane

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.USER_INPUT);
  const [userInputs, setUserInputs] = useState<UserInputs | null>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [bookStructure, setBookStructure] = useState<BookStructure | null>(null);
  const [chapterTasks, setChapterTasks] = useState<ChapterTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutoGeneratingChapters, setIsAutoGeneratingChapters] = useState<boolean>(false);
  const [activelyGeneratingChapterId, setActivelyGeneratingChapterId] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  
  const generatingChapterContentRef = useRef<string>("");

  useEffect(() => {
    if (typeof process.env.API_KEY === 'undefined' || process.env.API_KEY === "") {
      console.error("CRITICAL: API_KEY environment variable is not set or is empty.");
      setApiKeyMissing(true);
    }
  }, []);


  const resetState = () => {
    setUserInputs(null);
    setBookTitle(null);
    setBookStructure(null);
    setChapterTasks([]);
    setError(null);
    setCurrentStep(AppStep.USER_INPUT);
    setIsLoading(false);
    setIsAutoGeneratingChapters(false);
    setActivelyGeneratingChapterId(null);
    generatingChapterContentRef.current = "";
  };
  
  const handleUserInputSubmit = async (inputs: UserInputs) => {
    if (apiKeyMissing) {
      setError("Application is not configured correctly. API Key is missing.");
      return;
    }
    setUserInputs(inputs);
    setCurrentStep(AppStep.GENERATING_OUTLINE);
    setIsLoading(true);
    setError(null);
    setBookStructure(null);
    setBookTitle(null);
    setChapterTasks([]); 

    let accumulatedStructure = "";
    try {
      const stream = await geminiService.generateBookStructureStream(inputs);
      for await (const chunk of stream) {
        accumulatedStructure += chunk.text;
      }
      const structure = geminiService.parseJsonFromText(accumulatedStructure);
      setBookStructure(structure);

      const title = await geminiService.generateBookTitle(inputs, structure);
      setBookTitle(title);
      setCurrentStep(AppStep.OUTLINE_REVIEW);
    } catch (err) {
      console.error("Error during outline/title generation:",err);
      setError(err instanceof Error ? err.message : 'Failed to generate outline or title.');
      setCurrentStep(AppStep.USER_INPUT); 
    } finally {
      setIsLoading(false);
    }
  };

  const flattenStructureToTasks = useCallback((structure: BookStructure): ChapterTask[] => {
    const tasks: ChapterTask[] = [];
    let order = 0;
    for (const [key, value] of Object.entries(structure)) {
      const sanitizedKey = key.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      const id = `${sanitizedKey || 'chapter'}-${Date.now()}-${order}`; 
      order++;
      
      const chapterOutlineJson = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      
      tasks.push({ 
        id, 
        title: key, 
        description: chapterOutlineJson, 
        path: [key], 
        status: 'pending', 
        content: '' 
      });
    }
    return tasks;
  }, []);
  
  useEffect(() => {
    if (bookStructure && (currentStep === AppStep.OUTLINE_REVIEW || currentStep === AppStep.GENERATING_CHAPTERS)) {
       if(chapterTasks.length === 0 || (currentStep === AppStep.OUTLINE_REVIEW && chapterTasks.every(t => t.status === 'pending'))) {
            setChapterTasks(flattenStructureToTasks(bookStructure));
       }
    }
  }, [bookStructure, currentStep, chapterTasks, flattenStructureToTasks]);

  const handleProceedToChapterGeneration = () => {
    if (bookStructure) {
      setChapterTasks(flattenStructureToTasks(bookStructure)); 
      setCurrentStep(AppStep.GENERATING_CHAPTERS);
      setError(null); 
    }
  };

  const startAutomaticChapterGeneration = () => {
    setIsAutoGeneratingChapters(true);
    setError(null); 
  };

  const handleGenerateChapterContent = useCallback(async (taskId: string) => {
    if (!userInputs || !bookStructure || !isAutoGeneratingChapters || apiKeyMissing) return;
    
    const taskIndex = chapterTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || chapterTasks[taskIndex].status !== 'pending') return;

    setActivelyGeneratingChapterId(taskId);
    setChapterTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'generating', errorMessage: undefined, content: '' } : t));
    generatingChapterContentRef.current = ""; 

    try {
      const taskToGenerate = chapterTasks[taskIndex];
      const previouslyGeneratedContent = chapterTasks
        .slice(0, taskIndex)
        .filter(t => t.status === 'done' && t.content)
        .map(t => `Chapter: ${t.title}\n${t.content}\n\n---END OF PREVIOUS CHAPTER---\n\n`)
        .join('');
      
      const fullBookStructureJson = JSON.stringify(bookStructure, null, 2);

      const stream = await geminiService.generateChapterContentStream(
        userInputs,
        taskToGenerate.title, 
        taskToGenerate.description, 
        fullBookStructureJson,
        previouslyGeneratedContent
      );

      for await (const chunk of stream) {
        const textChunk = chunk.text; 
        if (typeof textChunk === 'string') { 
            generatingChapterContentRef.current += textChunk;
            setChapterTasks(prev => prev.map(t => t.id === taskId ? { ...t, content: generatingChapterContentRef.current } : t));
        }
      }
      // Trim the final content to remove any leading/trailing whitespace from AI.
      const finalContent = (generatingChapterContentRef.current || "").trim(); 
      setChapterTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done', content: finalContent } : t));
    } catch (err) {
      console.error(`Error generating content for task ${taskId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chapter content.';
      // Keep potentially partially generated content on error for review
      setChapterTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', errorMessage, content: (generatingChapterContentRef.current || "").trim() } : t)); 
      setError(`Error in chapter: ${chapterTasks.find(t=>t.id === taskId)?.title || 'Unknown'}. ${errorMessage}`); 
      setIsAutoGeneratingChapters(false); 
    } finally {
      setActivelyGeneratingChapterId(null);
      generatingChapterContentRef.current = ""; 
    }
  }, [userInputs, bookStructure, chapterTasks, isAutoGeneratingChapters, apiKeyMissing]); 

  useEffect(() => {
    if (currentStep === AppStep.GENERATING_CHAPTERS && isAutoGeneratingChapters && !activelyGeneratingChapterId && !apiKeyMissing) {
      const nextTask = chapterTasks.find(task => task.status === 'pending');
      if (nextTask) {
        handleGenerateChapterContent(nextTask.id);
      } else {
        setIsAutoGeneratingChapters(false); 
      }
    }
  }, [currentStep, chapterTasks, isAutoGeneratingChapters, activelyGeneratingChapterId, handleGenerateChapterContent, apiKeyMissing]);

  if (apiKeyMissing) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center text-center bg-slate-900 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
          <h1 className="text-4xl font-extrabold text-red-500 mb-6">Configuration Error</h1>
          <p className="text-slate-300 text-lg mb-4">
            The <code>API_KEY</code> environment variable is not set or is invalid.
          </p>
          <p className="text-slate-400">
            Please ensure the API key is correctly configured for KBook AI to function.
            Refer to the setup instructions.
          </p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case AppStep.USER_INPUT:
        return <UserInputPane onNext={handleUserInputSubmit} isLoading={isLoading} />;
      case AppStep.GENERATING_OUTLINE:
        return <div className="flex flex-col items-center justify-center min-h-[50vh]"><LoadingIndicator text="Crafting your book's blueprint (this may take a moment)..." size="lg" /></div>;
      case AppStep.OUTLINE_REVIEW:
        return <OutlineReviewPane title={bookTitle} structure={bookStructure} chapterTasks={chapterTasks} onProceed={handleProceedToChapterGeneration} onGoBack={() => { resetState(); setCurrentStep(AppStep.USER_INPUT);}} isLoading={isLoading} />;
      case AppStep.GENERATING_CHAPTERS:
        return <ChapterGenerationPane tasks={chapterTasks} onStartGeneration={startAutomaticChapterGeneration} isAutoGenerating={isAutoGeneratingChapters} activelyGeneratingChapterId={activelyGeneratingChapterId} onComplete={() => setCurrentStep(AppStep.VIEW_BOOK)} onGoBack={() => setCurrentStep(AppStep.OUTLINE_REVIEW)} />;
      case AppStep.VIEW_BOOK:
        return <BookViewPane title={bookTitle} chapters={chapterTasks} onStartOver={resetState} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <header className="text-center mb-4">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            KBook AI
          </span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Your AI Powered Book Creation Assistant</p>
      </header>
      
      {currentStep !== AppStep.USER_INPUT && <ProgressBar currentStep={currentStep} />}
      
      {error && (
        <div className="my-4 p-4 bg-red-800/50 border border-red-700 text-red-200 rounded-md text-center" role="alert">
          <strong>Error:</strong> {error}
          {currentStep === AppStep.GENERATING_CHAPTERS && <p className="text-sm">Automatic generation may have stopped. You can review completed chapters or try starting over.</p>}
        </div>
      )}
      
      <main className="flex-grow flex flex-col items-center justify-center w-full">
        {renderCurrentStep()}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-700">
        <p className="text-sm text-slate-500">KBook &copy; {new Date().getFullYear()}. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;