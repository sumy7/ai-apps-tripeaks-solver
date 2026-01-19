import React, { useRef } from 'react';

interface ControlsProps {
  onNewGame: () => void;
  onSolve: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (jsonString: string) => void;
  isPlaying: boolean;
  onResume?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onNewGame,
  onSolve,
  onReset,
  onExport,
  onImport,
  isPlaying,
  onResume,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
    // Reset input value to allow importing the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center p-4">
      <button
        onClick={onNewGame}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md"
      >
        新游戏
      </button>
      <button
        onClick={onSolve}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
      >
        {isPlaying ? '求解' : '继续求解'}
      </button>
      {!isPlaying && onResume && (
        <button
          onClick={onResume}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-md"
        >
          继续游戏
        </button>
      )}
      <button
        onClick={onReset}
        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors shadow-md"
      >
        重置
      </button>
      <button
        onClick={onExport}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md"
      >
        导出
      </button>
      <button
        onClick={handleImportClick}
        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors shadow-md"
      >
        导入
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default Controls;
