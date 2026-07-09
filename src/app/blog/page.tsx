import { getPosts, getCategories, Post, Category } from '@/lib/graphql-client';
import { BlogDirectoryClient } from '@/components/BlogDirectoryClient';
import { Suspense } from 'react';

export const metadata = {
  title: "Insights Directory | WAO GPT",
  description: "Browse our comprehensive directory of AI industry analyses, platform reviews, dynamic agents strategy, and cost architecture profiles.",
};

export default async function BlogPage() {
  let livePosts: Post[] = [];
  let wpCategories: Category[] = [];

  try {
    const postsData = await getPosts(100); // Fetch a larger batch for directory filtering
    if (postsData?.nodes && postsData.nodes.length > 0) {
      livePosts = postsData.nodes.filter((post: any) => post.slug && post.slug !== 'hello-world');
    }
    wpCategories = await getCategories();
  } catch (err) {
    console.error('Failed to load blog page data from WordPress', err);
  }

  // If categories are empty, create default ones based on our live publications
  const categoriesList = wpCategories.length > 0 ? wpCategories : [
    { id: 'cat-1', name: 'AI News', slug: 'ai-news', count: 1 },
    { id: 'cat-2', name: 'Automation', slug: 'automation', count: 2 },
    { id: 'cat-3', name: 'Agents', slug: 'agents', count: 1 },
    { id: 'cat-4', name: 'Productivity', slug: 'productivity', count: 1 },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-20 flex flex-col gap-10 bg-background text-foreground">
      {/* Editorial Title */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="text-muted-foreground font-mono text-[9px] tracking-[0.2em] uppercase">
          Research Publications
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          The Insight Briefings
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Deep-dives, framework designs, and tactical profiles decoding large-scale artificial intelligence developments for enterprise.
        </p>
      </div>

      {livePosts.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-muted-foreground uppercase tracking-wider">
          No briefings currently available in the archives.
        </div>
      ) : (
        <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-muted-foreground uppercase tracking-wider">Retrieving intelligence feeds...</div>}>
          <BlogDirectoryClient 
            initialPosts={livePosts} 
            categories={categoriesList} 
          />
        </Suspense>
      )}
    </div>
  );
}
