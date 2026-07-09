'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { FiMapPin } from "react-icons/fi";
import Image from "next/image";

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('ALL FIELDS ARE REQUIRED AND EMAIL MUST BE VALID.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      toast.success('SUCCESSFULLY SUBSCRIBED TO THE EDITORIAL REGISTER.');
      setEmail('');
    } catch (err) {
      toast.error('REGISTRATION FAILURE. PLEASE RETRY.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="newsletter" className="w-full border-t border-border bg-transparent pt-16 pb-8">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border">

          {/* Column 1: Logo + Description + Address */}
          <div className="flex flex-col gap-4">
            <Image
              src="/waogptcomsecondlogo.png"
              alt="WAOGPT Logo"
              width={120}
              height={48}
              className="object-contain"
              priority
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
              Translating the artificial intelligence economy for business leaders, founders, and developers.
            </p>
            <div className="mt-2 border-t border-border pt-4 flex flex-col gap-1 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <FiMapPin className="text-muted-foreground" />
                <span>Green Code Technologies Limited</span>
              </div>
              <span>4th Floor Office</span>
              <span>205 Regent Street</span>
              <span>London, England W1B 4HB</span>
              <span>United Kingdom</span>
            </div>
          </div>

          {/* Column 2: Publications */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">Publications</span>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><a href="/blog?category=ai-news" className="hover:text-foreground transition-colors">AI News</a></li>
              <li><a href="/blog?category=automation" className="hover:text-foreground transition-colors">Automation</a></li>
              <li><a href="/blog?category=agents" className="hover:text-foreground transition-colors">AI Agents</a></li>
              <li><a href="/blog?category=productivity" className="hover:text-foreground transition-colors">Productivity</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">Resources</span>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><a href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</a></li>
              <li><a href="/feed.xml" className="hover:text-foreground transition-colors">RSS Feed</a></li>
              <li><a href="/cms" className="hover:text-foreground transition-colors">CMS Console</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">Weekly Register</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get premium business analyses and AI breakdowns delivered directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={success}
                className="flex-grow rounded-none border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder-zinc-400 focus:outline-none disabled:opacity-50 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading || success}
                className="flex h-10 px-4 items-center justify-center rounded-none border border-border bg-foreground text-background hover:opacity-90 transition-all disabled:bg-secondary disabled:text-muted-foreground cursor-pointer font-mono text-[10px] tracking-wider uppercase"
              >
                {loading ? '...' : success ? 'OK' : 'JOIN'}
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <span>&copy; {currentYear} WAO GPT. All rights reserved.</span>
          <span className="font-mono">
            Designed for <span className="text-foreground font-semibold">Enterprise</span> &bull; Powered by <span className="text-foreground font-semibold">Headless WP</span>
          </span>
        </div>
      </div>
    </footer>
  );
}