
import React, { useState } from 'react';
import { UserInputs, LanguageOption, GenerationMode } from '../types';
import { AVAILABLE_LANGUAGES } from '../constants';
import DetailedCustomizationModal, { ValueMapItem } from './DetailedCustomizationModal';

interface UserInputPaneProps {
  onNext: (inputs: UserInputs) => void;
  isLoading: boolean;
}

interface ModalConfig {
  type: 'length' | 'level';
  title: string;
  currentValue: number;
  min: number;
  max: number;
  step: number;
  valueLabelFormatter?: (value: number, valueMap?: ValueMapItem[]) => string;
  valueMap?: ValueMapItem[];
  allowDirectInput?: boolean;
  directInputSuffix?: string;
}

const CONTENT_LENGTH_PRESETS = {
  short: 500,
  medium: 7000, // Updated default chapter length
  long: 15000, // Adjusted long to be significantly more than new medium
};

// Updated descriptive map for reading levels
const READING_LEVEL_DESCRIPTIVE_MAP: ValueMapItem[] = [
  { value: 2, label: "Kindergarten" },
  { value: 4, label: "Middle School" },
  { value: 5, label: "Standard" }, // General/average level
  { value: 7, label: "High School" },
  { value: 8, label: "College" },
  { value: 10, label: "Graduate School" },
];

// Updated presets for the dropdown, mapping to the new numeric values
const READING_LEVEL_PRESETS = {
  kindergarten: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "Kindergarten")!.value,     // 2
  middle: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "Middle School")!.value,        // 4
  standard: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "Standard")!.value,          // 5
  high: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "High School")!.value,            // 7
  college: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "College")!.value,          // 8
  graduate: READING_LEVEL_DESCRIPTIVE_MAP.find(rl => rl.label === "Graduate School")!.value,   // 10
};


const UserInputPane: React.FC<UserInputPaneProps> = ({ onNext, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<string>(AVAILABLE_LANGUAGES[0].code);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('normal');
  
  const [contentLength, setContentLength] = useState<number>(CONTENT_LENGTH_PRESETS.medium);
  const [readingLevel, setReadingLevel] = useState<number>(READING_LEVEL_PRESETS.standard); // Default to Standard
  const [numberOfChapters, setNumberOfChapters] = useState<number>(12);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && numberOfChapters >= 12) {
      onNext({ subject, language, additionalInfo, generationMode, contentLength, readingLevel, numberOfChapters });
    }
  };

  const openModal = (type: 'length' | 'level') => {
    if (type === 'length') {
      setModalConfig({
        type,
        title: 'Customize Chapter Length',
        currentValue: contentLength,
        min: 200, // Min word count
        max: 20000, // Slider's visual max, direct input can be higher
        step: 100,
        allowDirectInput: true,
        directInputSuffix: "words",
        valueLabelFormatter: (val) => `${val} words`,
      });
    } else { // type === 'level'
      setModalConfig({
        type,
        title: 'Customize Reading Level',
        currentValue: readingLevel,
        min: 1, // Underlying numerical scale
        max: 10,
        step: 1,
        valueMap: READING_LEVEL_DESCRIPTIVE_MAP,
        // Formatter for modal display using valueMap
        valueLabelFormatter: (val, vMap = READING_LEVEL_DESCRIPTIVE_MAP) => {
            // Find closest label for slider display
            let closest = vMap[0];
            for (const item of vMap) {
                if (Math.abs(item.value - val) < Math.abs(closest.value - val)) {
                    closest = item;
                }
                 // Prefer exact match or lower bound if multiple are equally close
                if (Math.abs(item.value - val) === Math.abs(closest.value - val) && item.value <= val) {
                    closest = item;
                }
            }
            const exactMatch = vMap.find(item => item.value === val);
            return exactMatch ? exactMatch.label : `~${closest.label} (Level ${val}/10)`;
        },
        allowDirectInput: false, 
      });
    }
    setIsModalOpen(true);
  };

  const handleModalApply = (newValue: number) => {
    if (modalConfig?.type === 'length') {
      setContentLength(newValue);
    } else if (modalConfig?.type === 'level') {
      setReadingLevel(newValue);
    }
  };
  
  const getDropdownValue = (type: 'length' | 'level', currentValue: number): string => {
    if (type === 'length') {
        const presets = CONTENT_LENGTH_PRESETS;
        for (const [key, value] of Object.entries(presets)) {
          if (value === currentValue) return key;
        }
    } else { // type === 'level'
        const presets = READING_LEVEL_PRESETS;
        for (const [key, value] of Object.entries(presets)) {
          if (value === currentValue) return key;
        }
    }
    return "custom"; 
  };

  const getReadingLevelLabel = (value: number): string => {
    const found = READING_LEVEL_DESCRIPTIVE_MAP.find(item => item.value === value);
    if (found) return found.label;
    
    let closestLabel = `Level ${value}/10`; 
    let closest = READING_LEVEL_DESCRIPTIVE_MAP[0];
    for (const item of READING_LEVEL_DESCRIPTIVE_MAP) {
        if (Math.abs(item.value - value) < Math.abs(closest.value - value)) {
            closest = item;
        }
        if (Math.abs(item.value - value) === Math.abs(closest.value - value) && item.value <= value) {
            closest = item;
        }
    }
    if (closest) closestLabel = `~${closest.label} (Level ${value}/10)`;
    
    return closestLabel;
  };


  return (
    <>
      <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-8">Let's Create Your Book!</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-1">
              Book Subject / Topic
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
              placeholder="e.g., The History of Space Exploration"
              required
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-1">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
              >
                {AVAILABLE_LANGUAGES.map((lang: LanguageOption) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="generationMode" className="block text-sm font-medium text-slate-300 mb-1">
                Generation Mode
              </label>
              <select
                id="generationMode"
                value={generationMode}
                onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
              >
                <option value="normal">Normal (Faster, Good Quality)</option>
                <option value="advanced">Advanced (Slower, Higher Quality)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contentLength" className="block text-sm font-medium text-slate-300 mb-1">
                Chapter Length
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="contentLength"
                  value={getDropdownValue('length', contentLength)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                        openModal('length');
                    } else {
                        setContentLength(CONTENT_LENGTH_PRESETS[val as keyof typeof CONTENT_LENGTH_PRESETS]);
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                >
                  <option value="short">Short (~{CONTENT_LENGTH_PRESETS.short} words)</option>
                  <option value="medium">Medium (~{CONTENT_LENGTH_PRESETS.medium} words)</option>
                  <option value="long">Long (~{CONTENT_LENGTH_PRESETS.long} words)</option>
                  {getDropdownValue('length', contentLength) === 'custom' && <option value="custom">Custom ({contentLength} words)</option>}
                </select>
                <button type="button" onClick={() => openModal('length')} className="p-2 text-sky-400 hover:text-sky-300" aria-label="Customize chapter length">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 hero-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.149-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="readingLevel" className="block text-sm font-medium text-slate-300 mb-1">
                Reading Level
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="readingLevel"
                  value={getDropdownValue('level', readingLevel)}
                   onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                        openModal('level');
                    } else {
                        setReadingLevel(READING_LEVEL_PRESETS[val as keyof typeof READING_LEVEL_PRESETS]);
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                >
                  {Object.entries(READING_LEVEL_PRESETS).map(([key, value]) => {
                    const desc = READING_LEVEL_DESCRIPTIVE_MAP.find(item => item.value === value);
                    return <option key={key} value={key}>{desc ? desc.label : `Level ${value}`}</option>;
                  })}
                  {getDropdownValue('level', readingLevel) === 'custom' && (
                    <option value="custom">Custom ({getReadingLevelLabel(readingLevel)})</option>
                  )}
                </select>
                 <button type="button" onClick={() => openModal('level')} className="p-2 text-sky-400 hover:text-sky-300" aria-label="Customize reading level">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 hero-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.149-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="numberOfChapters" className="block text-sm font-medium text-slate-300 mb-1">
              Number of Chapters (min. 12)
            </label>
            <input
              type="number"
              id="numberOfChapters"
              value={numberOfChapters}
              onChange={(e) => setNumberOfChapters(Math.max(12, parseInt(e.target.value, 10) || 12))}
              min="12"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-300 mb-1">
              Additional Instructions (Optional)
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
              placeholder="e.g., Target audience is young adults, focus on visual storytelling..."
              aria-label="Additional instructions for the book generation"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !subject.trim() || numberOfChapters < 12}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isLoading ? 'Generating...' : 'Start Creating Outline'}
          </button>
        </form>
      </div>
      {isModalOpen && modalConfig && (
        <DetailedCustomizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApply={handleModalApply}
          title={modalConfig.title}
          initialValue={modalConfig.currentValue}
          min={modalConfig.min}
          max={modalConfig.max}
          step={modalConfig.step}
          valueLabelFormatter={modalConfig.valueLabelFormatter}
          valueMap={modalConfig.valueMap}
          allowDirectInput={modalConfig.allowDirectInput}
          directInputSuffix={modalConfig.directInputSuffix}
        />
      )}
    </>
  );
};

export default UserInputPane;
