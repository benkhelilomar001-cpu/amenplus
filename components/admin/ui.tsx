import Link from "next/link";
import { QUOTE_STATUS_LABELS, type QuoteStatus } from "@/lib/constants";

export function AdminTitle({ title, children, back }: { title: string; children?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm text-stone-ink hover:text-charcoal">
          ← {back.label}
        </Link>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-light">{title}</h1>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Flash({ saved, deleted, error }: { saved?: boolean; deleted?: boolean; error?: string }) {
  if (error)
    return (
      <p role="alert" className="mb-6 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
        {error}
      </p>
    );
  if (saved || deleted)
    return (
      <p role="status" className="mb-6 border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
        {saved ? "Modifications enregistrées." : "Élément supprimé."}
      </p>
    );
  return null;
}

const STATUS_STYLES: Record<QuoteStatus, string> = {
  NEW: "bg-wood-ink text-white",
  IN_PROGRESS: "bg-ivory-deep text-charcoal",
  MISSING_INFO: "bg-[#f6e3c8] text-[#7a4a12]",
  QUOTE_SENT: "bg-[#dde7f2] text-[#2c4a6b]",
  WON: "bg-[#dcebdd] text-success",
  LOST: "bg-[#eee] text-stone-ink",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status in STATUS_STYLES ? status : "NEW") as QuoteStatus;
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s]}`}>{QUOTE_STATUS_LABELS[s]}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function Field({
  label,
  name,
  defaultValue,
  textarea = false,
  rows = 3,
  dir,
  hint,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  textarea?: boolean;
  rows?: number;
  dir?: "rtl" | "ltr";
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {textarea ? (
        <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} dir={dir} className="field resize-y" />
      ) : (
        <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} dir={dir} required={required} className="field" />
      )}
      {hint && <p className="mt-1 text-xs text-stone-ink">{hint}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-[var(--color-wood-ink)]" />
      <span>
        {label}
        {hint && <span className="block text-xs text-stone-ink">{hint}</span>}
      </span>
    </label>
  );
}

export const LOCALE_TABS = [
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية (arabe)", dir: "rtl" },
  { code: "en", label: "English (anglais)", dir: "ltr" },
] as const;

export function SubmitButton({ children = "Enregistrer" }: { children?: React.ReactNode }) {
  return (
    <button type="submit" className="btn btn-primary">
      {children}
    </button>
  );
}

export function sp(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
