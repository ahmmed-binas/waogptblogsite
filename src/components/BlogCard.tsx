// src/components/BlogCard.tsx
import { Post } from '@/lib/graphql-client';

interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'typography-first' | 'trending';
  rank?: number;
}

// Reading time calculator helper
export function calculateReadingTime(htmlContent: string = ''): number {
  const textOnly = htmlContent.replace(/<[^>]*>/g, '');
  const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;
  const wpm = 225; // average adult reading speed
  return Math.max(1, Math.ceil(wordCount / wpm));
}

export function BlogCard({ post, variant = 'default', rank }: BlogCardProps) {
  const readingTime = calculateReadingTime(post.content || post.excerpt || '');
  const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const category = post.categories?.nodes?.[0]?.name || 'Briefing';
  const imageUrl = post.featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=500&q=80';

  // 1. Monolithic Featured Card (Pure Asymmetric Typography & Composition)
  if (variant === 'featured') {
    return (
      <a 
        href={`/blog/${post.slug}`}
        className="group flex flex-col justify-between h-full bg-transparent border-0 p-0 hover:opacity-90 transition-opacity"
      >
        <div className="flex flex-col gap-6">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-none border border-border bg-secondary">
            <img 
              src={imageUrl} 
              alt={post.title}
              className="h-full w-full object-cover grayscale brightness-95 contrast-105 group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              <span>{category}</span>
              <span>&bull;</span>
              <span>{readingTime} min read</span>
            </div>

            <h3 className="font-serif text-3xl font-bold tracking-tight text-foreground leading-tight">
              {post.title}
            </h3>
            
            <p 
              className="text-xs text-muted-foreground leading-relaxed line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
          <span>By {post.author?.node?.name || 'WAO GPT'}</span>
          <span>{dateFormatted}</span>
        </div>
      </a>
    );
  }

  // 2. Typography-First Card (Clean Print Columns)
  if (variant === 'typography-first') {
    return (
      <a 
        href={`/blog/${post.slug}`}
        className="group flex flex-col justify-between h-full bg-transparent border-0 p-0 hover:opacity-90 transition-opacity"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
            <span>{category}</span>
            <span>&bull;</span>
            <span>{readingTime} min</span>
          </div>

          <h4 className="font-serif text-xl font-bold text-foreground leading-snug">
            {post.title}
          </h4>
          
          <p 
            className="text-xs text-muted-foreground leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
          <span>By {post.author?.node?.name || 'WAO GPT'}</span>
          <span>{dateFormatted}</span>
        </div>
      </a>
    );
  }

  // 3. Numbered Trending Card (Text Index Item)
  if (variant === 'trending') {
    return (
      <a 
        href={`/blog/${post.slug}`}
        className="group flex gap-6 py-6 border-b border-border bg-transparent hover:opacity-90 transition-opacity"
      >
        <span className="font-serif text-3xl font-light text-muted-foreground group-hover:text-foreground transition-colors leading-none select-none">
          {rank !== undefined ? String(rank).padStart(2, '0') : '•'}
        </span>
        <div className="flex flex-col gap-1 flex-grow">
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground">{category}</span>
          <h4 className="font-serif text-base font-bold text-foreground group-hover:text-muted-foreground leading-snug transition-colors line-clamp-2">
            {post.title}
          </h4>
          <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-muted-foreground/60 mt-1">
            Active Research Stream
          </span>
        </div>
      </a>
    );
  }

  // 4. Default Grid Card (Asymmetric Print Card)
  return (
    <a 
      href={`/blog/${post.slug}`}
      className="group flex flex-col justify-between h-full bg-transparent border-0 p-0 hover:opacity-90 transition-opacity"
    >
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-none border border-border bg-secondary">
          <img 
            src={imageUrl} 
            alt={post.title}
            className="h-full w-full object-cover grayscale brightness-95 group-hover:scale-[1.01] transition-transform duration-700"
            loading="lazy"
          />
        </div>
        
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground">
            <span>{category}</span>
            <span>&bull;</span>
            <span>{readingTime} min</span>
          </div>

          <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          
          <p 
            className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
        <span>By {post.author?.node?.name || 'WAO GPT'}</span>
        <span>{dateFormatted}</span>
      </div>
    </a>
  );
}
