
import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = "" }) => {
  // Simple markdown parser that converts string to React elements
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${elements.length}`} className="list-disc pl-5 mb-4 space-y-1">{currentList}</ul>);
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle Headers
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-lg font-bold mt-6 mb-2 text-deep-charcoal dark:text-white">{renderInline(trimmedLine.slice(4))}</h3>);
      } 
      // Handle Bullet Points
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        currentList.push(<li key={index} className="text-muted-text dark:text-dark-text-muted">{renderInline(trimmedLine.slice(2))}</li>);
      } 
      // Handle Paragraphs / Empty lines
      else if (trimmedLine === '') {
        flushList();
      } 
      else {
        flushList();
        elements.push(<p key={index} className="mb-4 leading-relaxed text-deep-charcoal dark:text-white">{renderInline(trimmedLine)}</p>);
      }
    });

    flushList();
    return elements;
  };

  // Helper to handle bolding within lines
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-deep-charcoal dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`prose prose-indigo dark:prose-invert max-w-none ${className}`}>
      {parseContent(content)}
    </div>
  );
};

export default MarkdownText;
