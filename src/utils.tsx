import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Triggers a global svara-toast message.
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const event = new CustomEvent('svara-toast', { 
    detail: { message, type } 
  });
  window.dispatchEvent(event);
}

/**
 * Parses a string and wraps any words bracketed with `[ ... ]`
 * into a highly visible, glowing, and breathing badge.
 * This instructs trainees/agents not to read them literally.
 */
export function renderHighlightedText(text: string) {
  if (!text) return null;
  
  // Regular expression to split on words that are enclosed in brackets [word]
  const parts = text.split(/(\[[^\]]+\])/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return (
            <span 
              key={index} 
              className="mx-1 px-2.5 py-0.5 rounded-md font-extrabold font-mono text-xs bg-amber-950/95 text-yellow-400 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.55)] bracket-breathing inline-block align-middle select-none"
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

