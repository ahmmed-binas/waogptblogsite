// src/components/TableOfContents.tsx
'use client';

import * as React from 'react';

interface HeadingItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  contentHtml: string;
  readingTime: number;
}

export function TableOfContents({ contentHtml, readingTime }: TableOfContentsProps) {
  const [headings, setHeadings] = React.useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');

  // Parse headings and assign IDs on mount
  React.useEffect(() => {
    // We select headings inside the article body content wrapper
    const articleBody = document.querySelector('.wp-content');
    if (!articleBody) return;

    const h2Elements = articleBody.querySelectorAll('h2');
    const items: HeadingItem[] = [];

    h2Elements.forEach((h2, index) => {
      // Slugify or assign incremental ID
      const text = h2.textContent || '';
      const id = h2.id || `heading-${index}`;
      h2.id = id; // ensure the element has the ID in DOM
      items.push({ id, text });
    });

    setHeadings(items);

    // IntersectionObserver to watch active heading
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // triggers when heading is in the upper part of viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    h2Elements.forEach((h2) => observer.observe(h2));

    return () => {
      observer.disconnect();
    };
  }, [contentHtml]);

  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-24 flex flex-col gap-6">
      <div className="text-muted-foreground font-mono text-[9px] tracking-[0.2em] uppercase">
        SECTION INDEX
      </div>

      <nav className="flex flex-col gap-3.5 border-l border-border pl-4">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleHeadingClick(e, heading.id)}
            className={`text-xs leading-relaxed transition-all duration-200 block font-mono uppercase tracking-wider ${
              activeId === heading.id
                ? 'text-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeId === heading.id ? '• ' : ''}{heading.text}
          </a>
        ))}
      </nav>

      <div className="border-t border-border pt-6 flex flex-col gap-1 text-muted-foreground font-mono text-[9px] tracking-[0.2em] uppercase">
        <span>READING METRIC:</span>
        <span className="text-foreground font-semibold">{readingTime} MINUTES</span>
      </div>
    </div>
  );
}
