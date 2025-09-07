import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from '@/lib/phosphor-icons-wrapper';

interface CodeBlockProps {
  code: string
  language?: string
  maxHeight?: string
  showCopyButton?: boolean
}

export function CodeBlock({ 
  code, 
  language = 'text', 
  maxHeight = '400px',
  showCopyButton = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group">
      {showCopyButton && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      )}
      
      <pre 
        className="bg-muted p-4 rounded-lg overflow-auto code-scroll text-sm font-mono"
        style={{ maxHeight }}
      >
        <code className="text-muted-foreground">
          {code}
        </code>
      </pre>
    </div>
  );
}