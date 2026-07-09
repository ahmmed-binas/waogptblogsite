// src/components/BlogDirectoryClient.tsx
'use client';

import * as React from 'react';
import { Post, Category } from '@/lib/graphql-client';
import { BlogCard } from './BlogCard';
import { calculateReadingTime } from './BlogCard';
import { useSearchParams } from 'next/navigation';

interface BlogDirectoryClientProps {
  initialPosts: Post[];
  categories: Category[];
}

export function BlogDirectoryClient({ initialPosts, categories }: BlogDirectoryClientProps) {
  const [posts] = React.useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categoryParam);
  const [sortBy, setSortBy] = React.useState<'latest' | 'oldest'>('latest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Sync category filter with search params (e.g. from Mega Menu click)
  React.useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // 1. Filter posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        post.categories?.nodes?.some(cat => cat.slug === selectedCategory);
      
      // Search filter
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, selectedCategory]);

  // 2. Sort posts
  const sortedPosts = React.useMemo(() => {
    const sorted = [...filteredPosts];
    if (sortBy === 'latest') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return sorted;
  }, [filteredPosts, sortBy]);

  // 3. Paginate posts
  const paginatedPosts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPosts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPosts, currentPage]);

  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        
        {/* Search & Layout Actions */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-xl">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">SEARCH:</span>
            <input
              type="text"
              placeholder="ENTER QUERY CRITERIA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-16 pr-4 py-2 text-xs text-foreground placeholder-zinc-400 focus:outline-none border-b border-border focus:border-foreground transition-all font-mono rounded-none"
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-start md:justify-end font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 border-b border-border pb-1">
              <span>SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
                className="bg-transparent border-0 outline-none text-foreground font-semibold cursor-pointer uppercase text-[9px]"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-4 border-b border-border pb-1">
              <span>VIEW:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`font-semibold cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'text-foreground underline underline-offset-4 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                GRID
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`font-semibold cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'text-foreground underline underline-offset-4 font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                LIST
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter underline text-tabs */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4 border-t border-border mt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`pb-1 text-[10px] font-mono tracking-[0.2em] transition-all border-b uppercase cursor-pointer ${
              selectedCategory === 'all'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Briefings
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`pb-1 text-[10px] font-mono tracking-[0.2em] transition-all border-b uppercase cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name} <span className="text-[9px] text-muted-foreground/60 font-mono ml-0.5">({cat.count || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid/List Results */}
      {paginatedPosts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          /* Premium List View */
          <div className="flex flex-col">
            {paginatedPosts.map((post) => {
              const readingTime = calculateReadingTime(post.content || post.excerpt || '');
              const imageUrl = post.featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=500&q=80';
              return (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row gap-8 py-8 border-b border-border bg-transparent hover:opacity-90 transition-opacity"
                >
                  <div className="relative aspect-16/10 sm:w-56 overflow-hidden rounded-none bg-secondary border border-border flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover grayscale brightness-90 contrast-110 group-hover:scale-[1.01] transition-transform duration-700"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-grow">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                          {post.categories?.nodes?.[0]?.name || 'Briefing'}
                        </span>
                        <span className="text-[9px] text-muted-foreground/40 font-mono">&bull;</span>
                        <span className="text-[9px] text-muted-foreground font-mono tracking-[0.2em] uppercase">
                          {readingTime} min read
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-muted-foreground transition-colors leading-snug">
                        {post.title}
                      </h3>
                      
                      <p
                        className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                      <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
                        By {post.author?.node?.name || 'WAO GPT Editor'}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center border-t border-b border-border bg-transparent">
          <h3 className="text-xs font-semibold text-foreground font-mono uppercase tracking-[0.2em]">No Briefings Located</h3>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] mt-2 max-w-sm leading-relaxed">
            The archive contains zero documents matching your current query parameters.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase transition-all disabled:opacity-20 disabled:pointer-events-none text-muted-foreground hover:text-foreground cursor-pointer"
          >
            &larr; Previous
          </button>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase transition-all disabled:opacity-20 disabled:pointer-events-none text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Next &rarr;
          </button>
        </div>
      )}

    </div>
  );
}
