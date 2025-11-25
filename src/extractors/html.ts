import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { BaseExtractor } from './base';
import { ExtractedText } from '../types';

export class HTMLExtractor extends BaseExtractor {
  async extract(filePath: string): Promise<ExtractedText[]> {
    const extractedTexts: ExtractedText[] = [];
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // Extract text content from all elements
      const walker = document.createTreeWalker(
        document.body || document.documentElement,
        dom.window.NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip script and style tags
            const parent = node.parentElement;
            if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
              return dom.window.NodeFilter.FILTER_REJECT;
            }
            
            const text = node.textContent?.trim();
            if (text && this.isValidText(text)) {
              return dom.window.NodeFilter.FILTER_ACCEPT;
            }
            
            return dom.window.NodeFilter.FILTER_REJECT;
          }
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (text && this.isValidText(text)) {
          // Try to get line number from source
          const lineNumber = this.getLineNumber(content, text);
          
          extractedTexts.push(
            this.createExtractedText(
              text,
              filePath,
              lineNumber,
              0,
              'html'
            )
          );
        }
      }

      // Extract text from attributes like title, alt, placeholder
      const elementsWithTextAttrs = document.querySelectorAll('[title], [alt], [placeholder], [aria-label]');
      elementsWithTextAttrs.forEach((element) => {
        const attrs = ['title', 'alt', 'placeholder', 'aria-label'];
        attrs.forEach(attr => {
          const value = element.getAttribute(attr);
          if (value && this.isValidText(value)) {
            const lineNumber = this.getLineNumber(content, value);
            extractedTexts.push(
              this.createExtractedText(
                value,
                filePath,
                lineNumber,
                0,
                'html'
              )
            );
          }
        });
      });

    } catch (error) {
      console.warn(`Failed to parse HTML file ${filePath}:`, error);
    }

    return extractedTexts;
  }

  private getLineNumber(content: string, text: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(text)) {
        return i + 1;
      }
    }
    return 1;
  }
}

