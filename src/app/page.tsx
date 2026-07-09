// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPosts, Post } from '@/lib/graphql-client';
import { BlogCard } from '@/components/BlogCard';
import Link from 'next/link';

export default function HomePage() {
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts(10)
      .then((wpPosts) => {
        if (wpPosts?.nodes && wpPosts.nodes.length > 0) {
          setLivePosts(
            wpPosts.nodes.filter((post: any) => post.slug && post.slug !== 'hello-world')
          );
        }
      })
      .catch((err) => console.error('Failed to load posts from WordPress', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-32 text-center text-muted-foreground font-mono uppercase text-xs tracking-wider">
        Loading briefings...
      </div>
    );
  }

  if (livePosts.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-32 text-center text-muted-foreground font-mono uppercase text-xs tracking-wider">
        No published briefings found in the archives.
      </div>
    );
  }

  const featuredPost = livePosts[0];
  const col2Post1 = livePosts[1] || livePosts[0];
  const col2Post2 = livePosts[2] || livePosts[0];
  const trendingPosts = livePosts.slice(0, 4);

  const faqs = [
    {
      q: "Scope & Mandate",
      a: "WAO GPT is an independent research publication. We audit autonomous execution layers, compute economics, and sovereign AI network distributions. We do not publish commercial SaaS product announcements."
    },
    {
      q: "Distribution Schedule",
      a: "Our core briefs are compiled and released bi-weekly on Tuesday mornings, following strict internal peer reviews of pipeline costs and architecture benchmarks."
    },
    {
      q: "Editorial Governance",
      a: "Submissions from principal architects, quant engineers, and sovereign strategists undergo anonymous technical reviews. We maintain strict non-advocacy standards."
    }
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-24 flex flex-col gap-24">

      {/* 1. Heading Block */}
      <section className="flex flex-col gap-4 border-b border-border pb-10">
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          WAO GPT / Strategic Index
        </span>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl leading-none">
          THE INTELLECTUAL AXIS OF THE INTELLIGENCE ECONOMY.
        </h1>
      </section>

      {/* 2. 3-Column Grid */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start border-b border-border pb-20">

        <div className="lg:col-span-6 h-full">
          <BlogCard post={featuredPost} variant="featured" />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-10">
          <div className="border-b border-border pb-3 flex justify-between items-center">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              Latest Analyses
            </span>
          </div>
          <div className="flex flex-col gap-10">
            <BlogCard post={col2Post1} variant="typography-first" />
            <div className="h-[1px] bg-border" />
            <BlogCard post={col2Post2} variant="typography-first" />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-none border border-border bg-transparent p-6 flex flex-col gap-6">
          <div>
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground">
              Editorial Briefings
            </span>
            <h3 className="font-serif text-lg font-bold text-foreground mt-3 leading-snug">
              Access the weekly briefs.
            </h3>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Synthesized teardowns of compute token budgets, sovereign localization guidelines, and RAG pipelines.
            </p>
          </div>
          <form id="newsletter-hero" className="flex flex-col gap-3 pt-4 border-t border-border">
            <input
              type="email"
              placeholder="email@company.com"
              className="rounded-none border border-border bg-transparent px-3 py-2 text-xs text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none transition-all font-mono"
            />
            <button
              type="submit"
              className="text-left font-mono text-[9px] tracking-[0.2em] uppercase text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
            >
              Submit Register &rarr;
            </button>
          </form>
        </div>
      </section>

      {/* 3. Latest Featured Post — automatic from WP */}
      <section className="border-b border-border pb-20 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
            Latest Publication
          </span>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground border-b border-foreground hover:text-muted-foreground transition-colors"
          >
            Read Full Article &rarr;
          </Link>
        </div>

        {featuredPost.featuredImage?.node?.sourceUrl && (
          <div className="overflow-hidden border border-border">
            <img
              src={featuredPost.featuredImage.node.sourceUrl}
              alt={featuredPost.title}
              className="w-full h-[420px] object-cover grayscale hover:grayscale-0 transition duration-500"
            />
          </div>
        )}

        <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
          {featuredPost.title}
        </h2>

        <div
          className="text-sm text-muted-foreground leading-relaxed max-w-3xl"
          dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }}
        />
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-b border-border pb-20">

        <Link href="/blog" className="lg:col-span-3 group">
          <div className="relative rounded-none border border-border bg-foreground p-8 flex flex-col gap-8 overflow-hidden h-full cursor-pointer transition-all duration-300 group-hover:border-background/30 hover:-translate-y-[3px]">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90 group-hover:opacity-80 transition-opacity duration-300" />
            <span className="relative font-mono text-[8px] tracking-[0.2em] uppercase text-background/60 group-hover:text-background/90 transition-colors duration-300">
              Auto-Updating · No Editorial Filter
            </span>
            <div className="relative h-[1px] bg-background/15 group-hover:bg-background/40 transition-colors duration-300" />
            <div className="relative flex flex-col gap-3">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-background/60 group-hover:text-background/90 transition-colors duration-300">
                Live Intelligence Feed
              </span>
              <h3 className="font-serif text-2xl font-bold text-background leading-snug group-hover:opacity-80 transition-opacity duration-300">
                Real-time signal stream, unfiltered.
              </h3>
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-background/40 group-hover:text-background/70 transition-colors duration-300 mt-2">
                View Feed &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* Right: Blog Posts */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="border-b border-border pb-3 flex justify-between items-center">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              Latest Signals
            </span>
            <Link
              href="/blog"
              className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground border-b border-foreground hover:text-muted-foreground hover:border-muted-foreground transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {livePosts.slice(0, 4).map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex gap-4 py-4 group hover:opacity-70 transition"
              >
                {post.featuredImage?.node?.sourceUrl && (
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    className="w-16 h-16 object-cover flex-shrink-0 rounded-sm"
                  />
                )}
                <div className="flex flex-col gap-1 justify-center">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                    {post.categories?.nodes?.[0]?.name || "Briefing"}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-foreground group-hover:underline leading-snug">
                    {post.title}
                  </h4>
                  <span className="font-mono text-[8px] text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </section>

      {/* 5. Trending Index + Editorial Mandate */}
      <section className="grid grid-cols-1 gap-16 lg:grid-cols-12 items-start">

        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              Trending Briefings
            </span>
          </div>
          <div className="flex flex-col">
            {trendingPosts.map((post, index) => (
              <BlogCard
                key={`trending-${post.id}`}
                post={post}
                variant="trending"
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-10">
          <div className="border-b border-border pb-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              Editorial Mandate
            </span>
          </div>
          <div className="flex flex-col gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="flex flex-col gap-2">
                <h4 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider">
                  {faq.q}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Organization Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WAO GPT",
            "url": "https://waogpt.com",
            "logo": "https://waogpt.com/logo.png",
            "description": "Translating the artificial intelligence economy for business leaders, founders, and developers.",
            "sameAs": []
          })
        }}
      />

    </div>
  );
}
