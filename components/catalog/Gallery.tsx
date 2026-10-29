"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { url: string; isInspiration: boolean; alt: string };

export function Gallery({
  images,
  labels,
}: {
  images: Img[];
  labels: { inspiration: string; gallery: string; show: string[] };
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  if (!current) return <div className="wood-placeholder aspect-square" />;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        {current.isInspiration && (
          <span className="absolute bottom-3 start-3 rounded-sm bg-charcoal/70 px-2 py-1 text-xs font-medium text-ivory backdrop-blur-sm">
            {labels.inspiration}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={labels.gallery}>
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={labels.show[i]}
                aria-pressed={i === index}
                className={`relative block aspect-square w-full overflow-hidden bg-ivory transition-opacity ${
                  i === index ? "ring-2 ring-wood-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
