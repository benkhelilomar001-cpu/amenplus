"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Minus, Paperclip, Plus, Trash2, X } from "lucide-react";
import { quoteCart, useQuoteCart } from "@/lib/quote-cart";
import { crossFieldErrors, fieldErrors, quoteSchema, type FieldErrorCode } from "@/lib/quote-schema";
import { MAX_UPLOAD_TOTAL, QUOTE_FILES, type ContactMethod, type CustomerType, type Locale } from "@/lib/constants";
import { compressImage } from "@/lib/compress-image";
import type { QuoteLabels } from "@/lib/quote-labels";

type Option = { value: string; label: string };
type ProductRef = { name: string; slug: string; image: string | null };

type Props = {
  mode: "QUOTE" | "CONTACT";
  locale: Locale;
  labels: QuoteLabels;
  products?: Record<string, ProductRef>;
  categories?: Option[];
  regions?: Option[];
  initial?: { customerType?: CustomerType; categorySlug?: string };
  links: { privacy: string; collections: string; productBase: string };
};

type Values = {
  customerType: CustomerType;
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod | "";
  region: string;
  city: string;
  categorySlug: string;
  description: string;
  dimensions: string;
  finish: string;
  budget: string;
  desiredDate: string;
  consent: boolean;
};

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

export function QuoteForm({ mode, locale, labels, products = {}, categories = [], regions = [], initial, links }: Props) {
  const isQuote = mode === "QUOTE";
  const cart = useQuoteCart();
  const items = isQuote ? cart.filter((i) => products[i.productId]) : [];

  const [values, setValues] = useState<Values>({
    customerType: initial?.customerType ?? "INDIVIDUAL",
    name: "",
    company: "",
    email: "",
    phone: "",
    preferredContact: "",
    region: "",
    city: "",
    categorySlug: initial?.categorySlug ?? "",
    description: "",
    dimensions: "",
    finish: "",
    budget: "",
    desiredDate: "",
    consent: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, FieldErrorCode>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");
  const startedAt = useRef(Date.now());
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addFiles = async (list: File[]) => {
    setFileError("");
    const next = [...files];
    for (const original of list) {
      if (next.length >= QUOTE_FILES.maxFiles) {
        setFileError(labels.filesTooMany);
        break;
      }
      if (!(QUOTE_FILES.mimes as readonly string[]).includes(original.type)) {
        setFileError(fill(labels.fileBadType, { name: original.name }));
        continue;
      }
      const f = await compressImage(original);
      if (f.size > QUOTE_FILES.maxBytes) {
        setFileError(fill(labels.fileTooBig, { name: f.name }));
        continue;
      }
      if (next.reduce((sum, x) => sum + x.size, 0) + f.size > MAX_UPLOAD_TOTAL) {
        setFileError(labels.filesTotalTooBig);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    const payload = {
      kind: mode,
      locale,
      ...values,
      preferredContact: values.preferredContact || undefined,
      company: values.customerType === "PROFESSIONAL" ? values.company : "",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, note: i.note })),
      consent: values.consent ? (true as const) : undefined,
    };
    const parsed = quoteSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors({ ...crossFieldErrors(payload), ...fieldErrors(parsed.error) });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setStatus("submitting");
    const body = new FormData();
    body.set("payload", JSON.stringify(parsed.data));
    body.set("startedAt", String(startedAt.current));
    body.set("website", (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "");
    files.forEach((f) => body.append("files", f));
    try {
      const res = await fetch("/api/quote", { method: "POST", body });
      const data = (await res.json()) as { ok: boolean; reference?: string; errors?: Record<string, FieldErrorCode>; code?: string };
      if (data.ok && data.reference) {
        setReference(data.reference);
        setStatus("success");
        if (isQuote) quoteCart.clear();
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerMessage(data.code === "rateLimited" ? labels.rateLimited : data.errors ? labels.errorSummary : labels.genericError);
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setServerMessage(labels.genericError);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="border border-success/30 bg-white p-8 text-center focus:outline-none" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl">{isQuote ? labels.successTitle : labels.successContactTitle}</h2>
        <p className="mx-auto mt-3 max-w-lg leading-relaxed text-stone-ink">
          {fill(labels.successText, { reference })}
        </p>
        <button
          type="button"
          className="btn btn-outline mt-6"
          onClick={() => {
            setStatus("idle");
            setFiles([]);
            setValues((v) => ({ ...v, description: "", dimensions: "", finish: "", budget: "", desiredDate: "", consent: false }));
            startedAt.current = Date.now();
          }}
        >
          {labels.newRequest}
        </button>
      </div>
    );
  }

  const errorText = (key: string) => (errors[key] ? labels.errors[errors[key]] ?? labels.errors.invalid : "");
  const describedBy = (key: string, hint?: string) => [errors[key] ? `${key}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined;
  const hasErrors = Object.keys(errors).length > 0 || Boolean(serverMessage);

  const Label = ({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) => (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
      {required ? (
        <span className="text-danger" aria-hidden="true"> *</span>
      ) : (
        <span className="font-normal text-stone-ink"> ({labels.optional})</span>
      )}
    </label>
  );
  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
        {errorText(name)}
      </p>
    ) : null;

  const text = (name: keyof Values, label: string, opts: { required?: boolean; type?: string; placeholder?: string; autoComplete?: string; dir?: string } = {}) => (
    <div>
      <Label htmlFor={name} required={opts.required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        value={values[name] as string}
        onChange={(e) => set(name, e.target.value as never)}
        placeholder={opts.placeholder}
        autoComplete={opts.autoComplete}
        dir={opts.dir}
        aria-required={opts.required || undefined}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name)}
        className="field"
      />
      <FieldError name={name} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {hasErrors && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger focus:outline-none">
          {serverMessage || labels.errorSummary}
        </div>
      )}

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="absolute -start-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {isQuote && (
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="font-display text-xl">
            {labels.cartTitle}
          </h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-stone-ink">
              {labels.cartEmpty}{" "}
              <Link href={links.collections} className="font-medium text-charcoal underline underline-offset-4">
                {labels.browse}
              </Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items.map((item) => {
                const ref = products[item.productId];
                return (
                  <li key={item.productId} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden bg-ivory">
                      {ref.image && <Image src={ref.image} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <Link href={`${links.productBase}/${ref.slug}`} className="font-medium hover:text-wood-ink">
                        {ref.name}
                      </Link>
                      <label className="mt-2 block">
                        <span className="sr-only">
                          {labels.itemNote} — {ref.name}
                        </span>
                        <input
                          type="text"
                          value={item.note}
                          maxLength={300}
                          onChange={(e) => quoteCart.update(item.productId, { note: e.target.value })}
                          placeholder={labels.itemNote}
                          className="field !min-h-10 !py-2 text-sm"
                        />
                      </label>
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                      <div className="flex h-10 items-center border border-line bg-white" role="group" aria-label={`${labels.quantity} — ${ref.name}`}>
                        <button
                          type="button"
                          onClick={() => quoteCart.update(item.productId, { quantity: Math.max(1, item.quantity - 1) })}
                          className="flex h-full w-10 items-center justify-center hover:bg-ivory"
                          aria-label={labels.decrease}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-10 text-center text-sm" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => quoteCart.update(item.productId, { quantity: Math.min(999, item.quantity + 1) })}
                          className="flex h-full w-10 items-center justify-center hover:bg-ivory"
                          aria-label={labels.increase}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => quoteCart.remove(item.productId)}
                        aria-label={fill(labels.remove, { name: ref.name })}
                        className="inline-flex items-center gap-1.5 text-sm text-stone-ink hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline" aria-hidden="true">
                          {fill(labels.remove, { name: "" }).trim()}
                        </span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-xl">{isQuote ? labels.step1 : labels.message}</legend>
        {isQuote && categories.length > 0 && (
          <div>
            <Label htmlFor="categorySlug">{labels.category}</Label>
            <select id="categorySlug" value={values.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} className="field">
              <option value="">{labels.categoryPlaceholder}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label htmlFor="description" required>
            {isQuote ? labels.description : labels.message}
          </Label>
          <textarea
            id="description"
            rows={5}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={isQuote ? labels.descriptionPlaceholder : undefined}
            maxLength={4000}
            aria-required
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy("description")}
            className="field resize-y"
          />
          <FieldError name="description" />
        </div>
        {isQuote && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {text("dimensions", labels.dimensions, { placeholder: labels.dimensionsPlaceholder })}
              {text("finish", labels.finish)}
              {text("budget", labels.budget)}
              {text("desiredDate", labels.desiredDate)}
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium">
                {labels.files} <span className="font-normal text-stone-ink">({labels.optional})</span>
              </span>
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-stone bg-white px-4 py-5 text-sm hover:border-wood-ink focus-within:border-wood-ink">
                <Paperclip className="h-4 w-4 text-wood-ink" aria-hidden="true" />
                <span>{labels.files}</span>
                <input
                  type="file"
                  multiple
                  accept={QUOTE_FILES.accept}
                  className="sr-only"
                  aria-describedby="files-hint"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    void addFiles(picked);
                  }}
                />
              </label>
              <p id="files-hint" className="mt-1.5 text-xs text-stone-ink">
                {labels.filesHint}
              </p>
              {fileError && (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fileError}
                </p>
              )}
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 bg-ivory px-3 py-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-wood-ink" aria-hidden="true" />
                        <span className="truncate">{f.name}</span>
                        <span className="shrink-0 text-xs text-stone-ink" dir="ltr">
                          {(f.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        aria-label={fill(labels.removeFile, { name: f.name })}
                        className="p-1 hover:text-danger"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-xl">{labels.step2}</legend>
        <div role="radiogroup" aria-labelledby="customerType-label">
          <span id="customerType-label" className="mb-2 block text-sm font-medium">
            {labels.customerType}
          </span>
          <div className="flex flex-wrap gap-3">
            {(["INDIVIDUAL", "PROFESSIONAL"] as const).map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-wood-ink ${
                  values.customerType === type ? "border-charcoal bg-charcoal text-ivory" : "border-line bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="customerType"
                  value={type}
                  checked={values.customerType === type}
                  onChange={() => set("customerType", type)}
                  className="sr-only"
                />
                {labels[type]}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("name", labels.name, { required: true, autoComplete: "name" })}
          {values.customerType === "PROFESSIONAL" && text("company", labels.company, { autoComplete: "organization" })}
        </div>
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("email", labels.email, { type: "email", autoComplete: "email", dir: "ltr" })}
            {text("phone", labels.phone, { type: "tel", autoComplete: "tel", dir: "ltr" })}
          </div>
          <p className="mt-2 text-xs text-stone-ink">{labels.contactHint}</p>
        </div>
        <div role="radiogroup" aria-labelledby="preferredContact-label">
          <span id="preferredContact-label" className="mb-2 block text-sm font-medium">
            {labels.preferredContact} <span className="font-normal text-stone-ink">({labels.optional})</span>
          </span>
          <div className="flex flex-wrap gap-4 text-sm">
            {(["EMAIL", "PHONE", "WHATSAPP"] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  value={m}
                  checked={values.preferredContact === m}
                  onChange={() => set("preferredContact", m)}
                  className="h-4 w-4 accent-[var(--color-wood-ink)]"
                />
                {labels[m]}
              </label>
            ))}
          </div>
        </div>
        {isQuote && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="region" required>
                {labels.region}
              </Label>
              <select
                id="region"
                value={values.region}
                onChange={(e) => set("region", e.target.value)}
                aria-required
                aria-invalid={errors.region ? true : undefined}
                aria-describedby={describedBy("region")}
                className="field"
              >
                <option value="">{labels.regionPlaceholder}</option>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <FieldError name="region" />
            </div>
            {text("city", labels.city, { autoComplete: "address-level2" })}
          </div>
        )}
      </fieldset>

      <div className="space-y-5">
        <div>
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={describedBy("consent")}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-wood-ink)]"
            />
            <span>
              {labels.consent}{" "}
              <Link href={links.privacy} className="underline underline-offset-4" target="_blank">
                {labels.privacyLink}
              </Link>
            </span>
          </label>
          <FieldError name="consent" />
        </div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto sm:min-w-64" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {labels.submitting}
            </>
          ) : isQuote ? (
            labels.submit
          ) : (
            labels.submitContact
          )}
        </button>
        {isQuote && <p className="text-xs text-stone-ink">{labels.noPayment}</p>}
      </div>
    </form>
  );
}
