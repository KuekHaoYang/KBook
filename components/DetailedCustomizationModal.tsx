
import React, { useState, useEffect, useCallback } from 'react';

export interface ValueMapItem {
  value: number;
  label: string;
}

interface DetailedCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newValue: number) => void;
  title: string;
  initialValue: number;
  min: number;
  max: number; // For slider's visual range; direct input can exceed this if allowDirectInput is true
  step: number;
  valueLabelFormatter?: (value: number, valueMap?: ValueMapItem[]) => string;
  valueMap?: ValueMapItem[]; // For mapping numerical values to descriptive labels (e.g., reading levels)
  allowDirectInput?: boolean; // If true, current value display becomes a number input
  directInputSuffix?: string; // e.g., "words"
}

const DetailedCustomizationModal: React.FC<DetailedCustomizationModalProps> = ({
  isOpen,
  onClose,
  onApply,
  title,
  initialValue,
  min,
  max,
  step,
  valueLabelFormatter = (value, vMap) => {
    if (vMap) {
      const mapped = vMap.find(item => item.value === value);
      if (mapped) return mapped.label;
    }
    return value.toString();
  },
  valueMap,
  allowDirectInput = false,
  directInputSuffix = "",
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue.toString());

  useEffect(() => {
    setCurrentValue(initialValue);
    setInputValue(initialValue.toString());
  }, [initialValue, isOpen]);

  const handleApply = () => {
    onApply(currentValue);
    onClose();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number(e.target.value);
    setCurrentValue(numValue);
    setInputValue(numValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // Keep string for direct typing
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue)) {
        setCurrentValue(Math.max(min, numValue)); // Enforce min
    } else if (e.target.value === "") {
        // Allow clearing the input, maybe default to min or handle as error
        setCurrentValue(min); // Or some other logic for empty input
    }
  };
  
  const handleInputBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      numValue = min;
    }
    setCurrentValue(numValue);
    setInputValue(numValue.toString());
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 id="modal-title" className="text-xl font-semibold text-sky-300 mb-6 text-center">{title}</h3>
        
        <div className="mb-6">
          <label htmlFor={allowDirectInput ? "directInput" : "sliderValue"} className="block text-sm font-medium text-slate-300 mb-2 text-center">
            Current Value: {' '}
            {allowDirectInput ? (
              <div className="inline-flex items-center bg-slate-700 rounded p-1">
                <input
                  type="number"
                  id="directInput"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  min={min} // Visual hint, but actual enforcement on blur/apply
                  className="w-24 px-2 py-1 bg-slate-700 text-sky-400 font-bold focus:ring-sky-500 focus:border-sky-500 border-slate-600 rounded"
                />
                {directInputSuffix && <span className="ml-1 text-sky-400 font-bold">{directInputSuffix}</span>}
              </div>
            ) : (
              <span className="font-bold text-sky-400">{valueLabelFormatter(currentValue, valueMap)}</span>
            )}
          </label>
          <input
            type="range"
            id="sliderValue"
            min={min}
            max={max} // Slider's visual max
            step={step}
            value={Math.min(currentValue, max)} // Slider knob doesn't exceed its own max
            onChange={handleSliderChange}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-sky-500 mt-2"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{valueLabelFormatter(min, valueMap)}</span>
            <span>{valueLabelFormatter(max, valueMap)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedCustomizationModal;
