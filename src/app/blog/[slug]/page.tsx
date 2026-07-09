// src/app/blog/[slug]/page.tsx
import { getPostBySlug, getPosts, getRelatedPosts, Post } from '@/lib/graphql-client';
import { TableOfContents } from '@/components/TableOfContents';
import { Comments } from '@/components/Comments';
import { calculateReadingTime } from '@/components/BlogCard';





interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}



export async function generateStaticParams() {
  const paths: Array<{ slug: string }> = [];

  try {
    const wpPosts = await getPosts(100);
    if (wpPosts?.nodes) {
      wpPosts.nodes.forEach((post: any) => {
        if (post.slug && post.slug !== 'hello-world') {
          paths.push({ slug: post.slug });
        }
      });
    }
  } catch (err) {
    console.error('Failed to get static paths from WordPress', err);
  }

  return paths;
}

export async function generateMetadata({ params }: PostPageProps): Promise<import('next').Metadata> {
  const resolvedParams = await params;
  
  try {
    const post = await getPostBySlug(resolvedParams.slug);
    if (!post) return { title: 'Not Found | WAO GPT' };

    const excerpt = post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 160) || '';
    const image = post.featuredImage?.node?.sourceUrl || '/waogptcomsecondlogo.png';

    return {
      title: `${post.title} | WAO GPT`,
      description: excerpt,
      alternates: {
        canonical: `https://waogpt.com/blog/${post.slug}`,
      },
      openGraph: {
        title: post.title,
        description: excerpt,
        url: `https://waogpt.com/blog/${post.slug}`,
        images: [{ url: image, width: 1200, height: 630 }],
        type: 'article',
        publishedTime: post.date,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: excerpt,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'WAO GPT | AI Business Publication',
      description: 'Latest artificial intelligence breakthroughs and strategic analyses.',
    };
  }
}


export default async function BlogPostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  let post: Post | null = null;
  let relatedPosts: Post[] = [];

  try {
    post = await getPostBySlug(slug);
  } catch (err) {
    console.error(`Failed to load post "${slug}" from WordPress`, err);
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-32 text-center bg-background text-foreground">
        <h1 className="font-serif text-2xl font-bold">Insight Briefing Not Found</h1>
        <p className="text-muted-foreground mt-2">The requested research document could not be located in our archives.</p>
        <a href="/blog" className="mt-6 inline-flex items-center gap-2 text-xs text-foreground hover:text-muted-foreground transition-colors font-mono uppercase tracking-[0.2em]">
          &larr; Return to Directory
        </a>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content || post.excerpt || '');
  const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const modifiedFormatted = post.modified ? new Date(post.modified).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) : dateFormatted;

  const category = post.categories?.nodes?.[0]?.name || 'Briefing';
  const categorySlug = post.categories?.nodes?.[0]?.slug || '';
  const imageUrl = post.featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=500&q=80';

  // Determine difficulty level dynamically
  let difficulty = 'Executive Overview';
  if (categorySlug === 'agents' || categorySlug === 'development') {
    difficulty = 'Advanced / Technical';
  } else if (categorySlug === 'automation' || categorySlug === 'productivity') {
    difficulty = 'Intermediate / Strategic';
  }

  // Tactical takeaways
  const takeaways = [
    `Contextual Assessment: Evaluate underlying data architectures prior to executing local distillation pathways.`,
    `Unit Economics Tracking: Model operational budgets on variable token queries, prioritizing open source models for static endpoints.`,
    `Sovereignty & Redundancy: Maintain local fallback parameters to prevent regional API disruptions.`
  ];

  try {
    if (categorySlug) {
      const related = await getRelatedPosts(categorySlug, post.id, 3);
      if (related && related.length > 0) {
        relatedPosts = related;
      }
    }
  } catch (e) {
    // ignore
  }

  return (
    <article className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-20 bg-background text-foreground">
      
      {/* 1. Back Navigation */}
      <div className="mb-12 border-b border-border pb-6">
        <a href="/blog" className="inline-flex items-center gap-2 text-[9px] font-mono text-muted-foreground hover:text-foreground transition-colors group uppercase tracking-[0.2em]">
          &larr; RETURN TO ARCHIVES
        </a>
      </div>

      {/* 2. Article Metadata Header */}
      <div className="max-w-5xl flex flex-col gap-6 mb-16">
        <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          <span>{category}</span>
          <span>&bull;</span>
          <span>{difficulty}</span>
          <span>&bull;</span>
          <span>{readingTime} min read</span>
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl leading-tight md:text-6xl max-w-4xl">
          {post.title}
        </h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-b border-border py-6 mt-8 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
          <div className="flex items-center gap-3">
            {post.author?.node?.avatar?.url ? (
              <img
                src={post.author.node.avatar.url}
                alt={post.author.node.name}
                className="h-8 w-8 rounded-none border border-border grayscale"
              />
            ) : (
              <div className="h-8 w-8 rounded-none bg-secondary flex items-center justify-center border border-border">
                <span>AU</span>
              </div>
            )}
            <div>
              <span className="block font-semibold text-foreground">BY {post.author?.node?.name || 'WAO GPT Editor'}</span>
              <span className="block text-muted-foreground mt-0.5">{dateFormatted}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="text-muted-foreground">
              UPDATED: {modifiedFormatted}
            </div>
            
            <div className="flex items-center gap-2">
              <span>SHARE:</span>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://waogpt.com/blog/${post.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-foreground hover:text-muted-foreground"
              >
                LINKEDIN
              </a>
              <span>/</span>
              <a 
                href={`https://twitter.com/intent/tweet?url=https://waogpt.com/blog/${post.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-foreground hover:text-muted-foreground"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Feature Image */}
      <div className="aspect-21/9 w-full overflow-hidden rounded-none border border-border bg-secondary mb-16">
        <img
          src={imageUrl}
          alt={post.title}
          className="h-full w-full object-cover grayscale brightness-95 contrast-105"
        />
      </div>

      {/* 4. Reading Layout */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Article Body */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          
          {/* Executive Summary Block */}
          {post.excerpt && (
            <div className="border-l border-border pl-6 py-2 my-2">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] block mb-3">Executive Summary</span>
              <p 
                className="text-sm text-foreground leading-relaxed font-mono uppercase tracking-wide"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            </div>
          )}

          {/* AI-Generated Dynamic Summary Panel */}
          <details className="group border border-border p-4 font-mono text-[11px] text-muted-foreground bg-transparent rounded-none cursor-pointer">
            <summary className="text-[10px] tracking-[0.2em] font-semibold text-muted-foreground group-hover:text-foreground transition-colors list-none flex items-center justify-between uppercase">
              <span>[+] REVEAL DYNAMIC STRUCTURAL DIGEST</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3 text-muted-foreground leading-relaxed">
              <p>01. CORE PARADIGM: FOCUSES ON VARIABLE INFERENCE PRICING MARGINS AND AUTONOMOUS EXECUTION LOOPS RATHER THAN SIMPLE CHAT DIALOGS.</p>
              <p>02. STRATEGIC PATH: MINIMIZES Operational COGS BY ROUTING COMPUTATION TO DISTILLED OPEN SOURCE MODEL CLUSTERS.</p>
              <p>03. RISK ANATOMY: PROPOSES HUMAN-IN-THE-LOOP SAFEGUARDS AS GLOBAL DATA POLICIES AND GPU SCARCITY FRAGMENT INTEGRATIONS.</p>
            </div>
          </details>

          {/* Main Article Rich Content */}
          <div 
            className="wp-content"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Key Takeaways Section */}
          <div className="border-t border-border pt-10 mt-6 flex flex-col gap-6">
            <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">TACTICAL TAKEAWAYS</h3>
            <ul className="flex flex-col gap-4">
              {takeaways.map((item, index) => (
                <li key={index} className="flex gap-4 text-xs leading-relaxed text-muted-foreground font-mono uppercase">
                  <span className="text-muted-foreground/60 font-bold select-none">0{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Author Biography Footer */}
          {post.author?.node?.description && (
            <div className="border border-border p-6 flex flex-col sm:flex-row gap-5 items-start mt-12">
              {post.author.node.avatar?.url && (
                <img
                  src={post.author.node.avatar.url}
                  alt={post.author.node.name}
                  className="h-10 w-10 rounded-none border border-border grayscale"
                />
              )}
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase">
                <span className="font-semibold text-foreground">BRIEFING LEAD: {post.author.node.name}</span>
                <p className="text-muted-foreground leading-relaxed normal-case">{post.author.node.description}</p>
              </div>
            </div>
          )}

          {/* Interactive Comments Thread */}
          <Comments postId={post.databaseId} initialComments={post.comments?.nodes || []} />
        </div>

        {/* Sidebar Sticky Table of Contents */}
        <div className="hidden lg:block lg:col-span-4 pl-8">
          <TableOfContents contentHtml={post.content || ''} readingTime={readingTime} />
        </div>
      </div>

      {/* 5. Related Briefings Footer Grid */}
      {relatedPosts.length > 0 && (
        <div className="mt-28 border-t border-border pt-16 flex flex-col gap-8">
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">RELATED BRIEFINGS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map((rPost) => (
              <a
                key={`related-${rPost.id}`}
                href={`/blog/${rPost.slug}`}
                className="group flex flex-col justify-between bg-transparent border-0 p-0 hover:opacity-90 transition-opacity"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden rounded-none bg-secondary border border-border">
                    <img
                      src={rPost.featuredImage?.node?.sourceUrl || imageUrl}
                      alt={rPost.title}
                      className="h-full w-full object-cover grayscale brightness-95 transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-muted-foreground transition-colors mt-5 line-clamp-2 leading-snug">
                    {rPost.title}
                  </h4>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                  <span>{new Date(rPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      
      
         <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "datePublished": post.date,
            "dateModified": post.modified || post.date,
            "author": {
              "@type": "Person",
              "name": post.author?.node?.name || "WAO GPT"
            },
            "publisher": {
              "@type": "Organization",
              "name": "WAO GPT",
              "url": "https://waogpt.com"
            },
            "image": post.featuredImage?.node?.sourceUrl || '',
            "url": `https://waogpt.com/blog/${post.slug}`,
            "description": post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 160) || ''
          })
        }}
      />

    </article>
  );
}
