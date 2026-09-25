"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  ["Home", "/"],
  ["Club", "/club"],
  ["Team", "/team"],
  ["Matches", "/matches"],
  ["News", "/news"],
  ["Media", "/media"],
  ["Shop", "/shop"],
  ["Contact", "/contact"],
] as const;

import { Facebook, Instagram, Youtube } from "lucide-react";

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.86-5.26 2.86-6.93 1.25-1.06 2.88-1.7 4.54-1.76V8.92c-.8.03-1.58.26-2.27.65-1.55.85-2.67 2.45-2.86 4.23-.2 1.76.51 3.58 1.83 4.74 1.29 1.15 3.16 1.48 4.79 1.05 1.54-.4 2.78-1.54 3.32-3.03.28-.79.37-1.63.36-2.47V.02z"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 4h2l1.7 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L20.5 7H6.2" />
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-5 lg:h-auto lg:gap-5 lg:px-8 lg:py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Solmart FC home" onClick={() => setOpen(false)}>
          <span className="relative grid size-10 shrink-0 overflow-hidden rounded-full bg-white sm:size-11">
            <Image src="/images/solmart-fc-logo.png" alt="Solmart FC official club crest" fill sizes="44px" className="object-cover" priority />
          </span>
          <span className="truncate text-sm font-black tracking-tight sm:text-lg">SOLMART FC</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {navItems.slice(1).map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-bold text-white/75 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:flex items-center gap-3 mr-4 pr-4 border-r border-white/20 text-white/50">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white"><Facebook size={16} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white"><Instagram size={16} /></a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white"><TiktokIcon /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white"><Youtube size={16} /></a>
          </div>
          <Link href="/cart" className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/10 sm:hidden" aria-label="Shopping cart">
            <CartIcon />
          </Link>
          <Link href="/account" className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/10 sm:hidden" aria-label="Account">
            <UserIcon />
          </Link>
          <Link href="/cart" className="hidden rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/10 sm:block lg:block">Cart</Link>
          <Link href="/account" className="hidden rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/10 sm:block lg:block">Account</Link>
          <Link href="/shop" className="hidden rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black hover:bg-red-700 sm:block">Shop</Link>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl hover:bg-white/10 lg:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`border-t border-white/10 bg-black lg:hidden ${open ? "block" : "hidden"}`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-5" aria-label="Mobile navigation">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition hover:bg-white/10 ${href === "/shop" ? "bg-red-600 text-white hover:bg-red-700" : "text-white/80"}`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-white/10 pt-3">
            <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">
              <CartIcon /> Cart
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">
              <UserIcon /> Account
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
