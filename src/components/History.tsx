import React from 'react';
import { HistoryStep } from '../types';

interface HistoryProps {
  history: HistoryStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

const History: React.FC<HistoryProps> = ({
  history,
  currentStepIndex,
  onStepClick,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold text-white mb-4">求解步骤历史</h2>
      <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {history.map((step, index) => (
            <button
              key={index}
              onClick={() => onStepClick(index)}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                index === currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">步骤 {index}:</span> {step.description}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
