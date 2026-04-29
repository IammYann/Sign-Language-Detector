/**
 * History Component
 * Displays detected text history with clear and export options
 */

import React from 'react';

const History = ({ history = [], onClear = () => {}, onItemDelete = () => {} }) => {
  const handleExport = () => {
    const text = history.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'sign_language_history.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Detection History</h3>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                💾 Export
              </button>
              <button
                onClick={onClear}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No history yet. Start capturing to see detected text here.
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors group"
            >
              <span className="text-sm text-gray-300">
                <span className="font-medium text-gray-400">{index + 1}.</span> {item}
              </span>
              <button
                onClick={() => onItemDelete(index)}
                className="px-2 py-1 text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t border-gray-700">
          <div>
            <span className="font-medium">Total Items:</span> {history.length}
          </div>
          <div>
            <span className="font-medium">Total Characters:</span> {history.join('').length}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
