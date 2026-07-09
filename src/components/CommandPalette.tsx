// src/components/CommandPalette.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getPosts, Post } from '@/lib/graphql-client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  // Debounced search query
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const postsData = await getPosts(6, null, undefined, query);
        setResults(postsData?.nodes || []);
      } catch (err) {
        console.error('Error searching:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/blog/${slug}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type to search insights, articles, and reviews..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="bg-popover text-foreground max-h-[350px] overflow-y-auto border-t border-border">
        {loading && (
          <div className="py-6 text-center text-xs font-mono text-muted-foreground animate-pulse uppercase tracking-wider">
            Searching archives...
          </div>
        )}
        {!loading && results.length === 0 && query.trim() !== '' && (
          <CommandEmpty className="py-6 text-center text-xs font-mono text-muted-foreground uppercase tracking-wider">
            No briefings located for "{query}".
          </CommandEmpty>
        )}
        {!loading && results.length === 0 && query.trim() === '' && (
          <div className="py-6 text-center text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Query criteria: "Automation", "Agents", or "Productivity"
          </div>
        )}
        {results.length > 0 && (
          <CommandGroup heading="EDITORIAL INDEX MATCHES" className="text-muted-foreground font-mono text-[9px] uppercase px-2 tracking-wider">
            {results.map((post) => (
              <CommandItem
                key={post.id}
                value={post.title}
                onSelect={() => handleSelect(post.slug)}
                className="flex items-center justify-between p-3 rounded-none hover:bg-secondary cursor-pointer transition-colors duration-200"
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-serif font-bold text-foreground group-hover:text-primary normal-case">
                    {post.title}
                  </span>
                  {post.categories?.nodes && post.categories.nodes.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider normal-case">
                      Archive: {post.categories.nodes[0].name}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground flex-shrink-0">&rarr;</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
