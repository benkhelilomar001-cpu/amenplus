import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Jost } from "next/font/google";
import { FileText, FolderOpen, Home, Image as ImageIcon, LogOut, Package, Settings, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { logout } from "./actions";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin AmenPlus" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.svg" },
};

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: Home },
  { href: "/admin/demandes", label: "Demandes", icon: FileText },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: FolderOpen },
  { href: "/admin/realisations", label: "Réalisations", icon: ImageIcon },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = await isAdmin();
  return (
    <html lang="fr" className={`${inter.variable} ${jost.variable}`}>
      <body className="min-h-dvh bg-paper">
        {loggedIn ? (
          <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
            <aside className="border-b border-line bg-white lg:border-b-0 lg:border-e">
              <div className="flex items-center justify-between px-5 py-5">
                <Link href="/admin">
                  <Logo compact />
                </Link>
                <span className="text-xs uppercase tracking-widest text-stone-ink">Admin</span>
              </div>
              <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-ivory">
                    <Icon className="h-4 w-4 text-wood-ink" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
                <a href="/fr" target="_blank" className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-ivory">
                  <ExternalLink className="h-4 w-4 text-wood-ink" aria-hidden="true" />
                  Voir le site
                </a>
                <form action={logout}>
                  <button type="submit" className="flex w-full shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-ivory">
                    <LogOut className="h-4 w-4 text-wood-ink" aria-hidden="true" />
                    Déconnexion
                  </button>
                </form>
              </nav>
            </aside>
            <main className="min-w-0 px-4 py-8 sm:px-8">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
