// src/components/Navbar.tsx
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { CommandPalette } from './CommandPalette';
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Close menu on path change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const categories = [
    { name: 'AI News', href: '/blog?category=ai-news' },
    { name: 'Automation', href: '/blog?category=automation' },
    { name: 'Agents', href: '/blog?category=agents' },
    { name: 'Productivity', href: '/blog?category=productivity' },
  ];

  return (
    <>
      <header className="w-full border-b border-border bg-background sticky top-0 z-40">
     <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-8">

  {/* LEFT SIDE (you removed this — MUST exist) */}
  <div className="flex items-center gap-12">

    <a
      href="/"
      className="font-serif text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5 select-none"
    >
<span>
  <Image
    src="/waogptcomsecondlogo.png"
    alt="WAOGPT Logo"
    width={100}
    height={40}
  />
</span>
      <span className="h-1 w-1 bg-foreground inline-block"></span>
    </a>

    <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
      <a 
        href="/" 
        className={`transition-colors hover:text-foreground ${pathname === '/' ? 'text-foreground font-semibold' : ''}`}
      >
        Home
      </a>

      <a 
        href="/blog" 
        className={`transition-colors hover:text-foreground ${pathname?.startsWith('/blog') ? 'text-foreground font-semibold' : ''}`}
      >
        Insights
      </a>

      {categories.map((cat) => (
        <a
          key={cat.name}
          href={cat.href}
          className="transition-colors hover:text-foreground"
        >
          {cat.name}
        </a>
      ))}
    </nav>

  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] uppercase">

    <button
      onClick={() => setSearchOpen(true)}
      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      Search <span className="text-muted-foreground/60 hidden sm:inline ml-1">(⌘K)</span>
    </button>

    <a
      href="#newsletter"
      className="hidden sm:inline-block text-foreground hover:text-muted-foreground transition-colors"
    >
      Subscribe
    </a>

    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
    >
      {mobileMenuOpen ? 'CLOSE' : 'MENU'}
    </button>

  </div>

</div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background px-6 py-8 md:hidden">
            <nav className="flex flex-col gap-6 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              <a href="/" className="hover:text-foreground">Home</a>
              <a href="/blog" className="hover:text-foreground">Insights</a>
              <div className="h-[1px] bg-border my-2" />
              {categories.map((cat) => (
                <a key={cat.name} href={cat.href} className="hover:text-foreground">
                  {cat.name}
                </a>
              ))}
              <a href="#newsletter" onClick={() => setMobileMenuOpen(false)} className="text-foreground pt-2">
                Subscribe
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Command Palette search modal */}
      <CommandPalette open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
