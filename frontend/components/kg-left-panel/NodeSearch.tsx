'use client';

import { SquareArrowOutUpRightIcon } from 'lucide-react';
import { unparse } from 'papaparse';
import React from 'react';
import { useKGStore } from '@/lib/hooks';
import { downloadFile } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

export function NodeSearch() {
  const nodeSearchQuery = useKGStore(state => state.nodeSearchQuery);
  const nodeSuggestions = useKGStore(state => state.nodeSuggestions);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [cursorPosition, setCursorPosition] = React.useState({ top: 0, left: 0 });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const measureSpanRef = React.useRef<HTMLSpanElement>(null);
  const sigmaInstance = useKGStore(state => state.sigmaInstance);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < nodeSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && nodeSuggestions.length > 0) {
      e.preventDefault();
      appendSuggestion(nodeSuggestions[selectedIndex]);
    }
  };

  const appendSuggestion = (suggestion: string) => {
    const words = nodeSearchQuery.split(/[\n,]/).filter(w => w.trim().length > 0);
    words.pop();
    words.push(suggestion);
    useKGStore.setState({ nodeSearchQuery: `${words.join(', ')}, `, nodeSuggestions: [] });
    textareaRef.current?.focus();
    setSelectedIndex(-1);
  };

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const computedStyle = window.getComputedStyle(textarea);

    if (!measureSpanRef.current) {
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'pre';
      span.style.pointerEvents = 'none';
      document.body.appendChild(span);
      measureSpanRef.current = span;
      span.style.font = computedStyle.font;
      span.style.fontSize = computedStyle.fontSize;
      span.style.fontFamily = computedStyle.fontFamily;
      span.style.fontWeight = computedStyle.fontWeight;
      span.style.letterSpacing = computedStyle.letterSpacing;
    }
    const span = measureSpanRef.current;

    const lineHeight = Number.parseFloat(computedStyle.lineHeight);
    const paddingTop = Number.parseFloat(computedStyle.paddingTop);
    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft);

    const textBeforeCursor = nodeSearchQuery.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;

    span.textContent = lines[lines.length - 1];
    const textWidth = span.getBoundingClientRect().width;

    setCursorPosition({
      top: paddingTop + currentLine * lineHeight - textarea.scrollTop,
      left: paddingLeft + textWidth,
    });
  };

  const handleQueryChange = (value: string) => {
    useKGStore.setState({ nodeSearchQuery: value });
    if (!value) useKGStore.setState({ nodeSuggestions: [] });
    updateCursorPosition();
  };

  const handleExport = () => {
    if (!sigmaInstance) return;
    const graph = sigmaInstance.getGraph();

    const content = graph.reduceNodes<any>((acc, node, attr) => {
      if (attr.highlighted) {
        acc.push({
          id: node,
          name: attr.label || '',
        });
      }
      return acc;
    }, []);
    downloadFile(unparse(content), 'selected_nodes.csv');
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-1.5 flex items-center justify-between w-full min-w-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
          Search Nodes
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 cursor-pointer text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline shrink-0 transition-colors"
          disabled={nodeSearchQuery.length === 0}
          onClick={handleExport}
        >
          Export
          <SquareArrowOutUpRightIcon size={11} className="text-current" />
        </button>
      </div>

      <div className="relative w-full min-w-0">
        <Textarea
          ref={textareaRef}
          placeholder="Search Nodes..."
          className="min-h-20 w-full bg-white text-xs border-gray-200 rounded-lg placeholder:text-gray-400 focus-visible:ring-teal-600 resize-none"
          value={nodeSearchQuery}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={updateCursorPosition}
        />
        
        {nodeSuggestions.length > 0 && (
          <ul
            className="absolute left-0 z-50 max-h-36 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white p-1 text-xs shadow-xl"
            style={{
              top: `${cursorPosition.top + 24}px`,
            }}
          >
            {nodeSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={`cursor-pointer rounded-md px-2 py-1.5 transition-colors truncate ${
                  index === selectedIndex 
                    ? 'bg-teal-50 text-teal-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => appendSuggestion(suggestion)}
                onKeyDown={() => {}}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}