"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { quoteCart, useQuoteCart } from "@/lib/quote-cart";

export type AddToQuoteLabels = {
  add: string;
  added: string;
  goToQuote: string;
  quantity: string;
  decrease: string;
  increase: string;
};

export function AddToQuote({
  product,
  quoteHref,
  labels,
}: {
  product: { id: string; slug: string; name: string; image: string | null };
  quoteHref: string;
  labels: AddToQuoteLabels;
}) {
  const items = useQuoteCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.productId === product.id);

  const add = () => {
    quoteCart.add({ productId: product.id, slug: product.slug, name: product.name, image: product.image, quantity: qty });
    setJustAdded(true);
    setQty(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <span id="qty-label" className="mb-1.5 block text-xs font-medium text-stone-ink">
            {labels.quantity}
          </span>
          <div className="flex h-[2.875rem] items-center border border-line bg-white" role="group" aria-labelledby="qty-label">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-full w-11 items-center justify-center hover:bg-ivory"
              aria-label={labels.decrease}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="number"
              min={1}
              max={999}
              value={qty}
              onChange={(e) => setQty(Math.min(999, Math.max(1, Number(e.target.value) || 1)))}
              className="h-full w-14 border-x border-line text-center [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-labelledby="qty-label"
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(999, q + 1))}
              className="flex h-full w-11 items-center justify-center hover:bg-ivory"
              aria-label={labels.increase}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <button type="button" onClick={add} className="btn btn-primary min-w-56 flex-1">
          {labels.add}
        </button>
      </div>
      <div aria-live="polite">
        {(justAdded || inCart) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-success">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" aria-hidden="true" />
              {labels.added}
            </span>
            <Link href={quoteHref} className="font-medium text-charcoal underline underline-offset-4">
              {labels.goToQuote}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
