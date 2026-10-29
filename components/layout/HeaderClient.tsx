"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useQuoteCart } from "@/lib/quote-cart";

type NavItem = { href: string; label: string };
type Lang = { code: string; label: string; name: string };

export type HeaderLabels = {
  mainNav: string;
  openMenu: string;
  closeMenu: string;
  menu: string;
  quote: string;
  quoteCart: string;
  language: string;
};

function isActive(pathname: string, href: string) {
  const depth = href.split("/").filter(Boolean).length;
  return depth === 1 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Swaps the locale segment of the current URL. */
function switchLocale(pathname: string, code: string) {
  const parts = pathname.split("/");
  parts[1] = code;
  return parts.join("/") || `/${code}`;
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative whitespace-nowrap px-2 py-2 text-[0.875rem] transition-colors xl:px-2.5 hover:text-wood-ink ${
                active ? "text-wood-ink after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-px after:bg-wood" : ""
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function LanguageSwitcher({ current, langs, label }: { current: string; langs: Lang[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex items-center text-xs tracking-[0.12em]">
        {langs.map((l, i) => (
          <li key={l.code} className="flex items-center">
            {i > 0 && <span className="mx-1 text-line" aria-hidden="true">/</span>}
            <Link
              href={switchLocale(pathname, l.code)}
              hrefLang={l.code}
              lang={l.code}
              aria-current={l.code === current ? "true" : undefined}
              title={l.name}
              className={`px-1 py-2 ${l.code === current ? "font-semibold text-charcoal" : "text-stone-ink hover:text-charcoal"}`}
            >
              {l.label}
              <span className="sr-only"> — {l.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CartLink({ href, label }: { href: string; label: string }) {
  const items = useQuoteCart();
  const count = items.length;
  return (
    <Link
      href={href}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm hover:bg-ivory"
      aria-label={count ? `${label} (${count})` : label}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute end-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-wood-ink px-1 text-[0.7rem] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function MobileMenu({
  items,
  quoteHref,
  labels,
  langs,
  current,
}: {
  items: NavItem[];
  quoteHref: string;
  labels: HeaderLabels;
  langs: Lang[];
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on navigation and on Escape; lock page scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm hover:bg-ivory"
      >
        {open ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
      </button>
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto border-t border-line bg-paper"
        >
          <nav aria-label={labels.mainNav} className="container-page py-6">
            <ul className="divide-y divide-line border-y border-line">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between py-4 font-display text-lg ${active ? "text-wood-ink" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={quoteHref} className="btn btn-primary mt-6 w-full">
              {labels.quote}
            </Link>
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-xs text-stone-ink">{labels.language} :</span>
              <LanguageSwitcher current={current} langs={langs} label={labels.language} />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
