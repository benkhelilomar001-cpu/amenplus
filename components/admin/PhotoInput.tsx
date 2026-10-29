"use client";

import { useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { MAX_UPLOAD_TOTAL } from "@/lib/constants";

/**
 * File input for admin photos: shrinks each photo in the browser (long side 2400 px)
 * and keeps the total under the hosting upload limit, then hands the result to the form.
 */
export function PhotoInput({ name, multiple = false }: { name: string; multiple?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <input
        type="file"
        name={name}
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="text-sm"
        onChange={async (e) => {
          const input = e.currentTarget;
          const picked = Array.from(input.files ?? []);
          if (picked.length === 0) return;
          setBusy(true);
          setMessage("Préparation des photos…");
          const kept: File[] = [];
          let total = 0;
          for (const file of picked) {
            const small = await compressImage(file, 2400, 0.85);
            if (total + small.size > MAX_UPLOAD_TOTAL) break;
            kept.push(small);
            total += small.size;
          }
          const dt = new DataTransfer();
          kept.forEach((f) => dt.items.add(f));
          input.files = dt.files;
          setBusy(false);
          setMessage(
            kept.length < picked.length
              ? `${kept.length} photo(s) sur ${picked.length} retenue(s) : la limite de 4 Mo par envoi est atteinte. Enregistrez, puis ajoutez les suivantes.`
              : `${kept.length} photo(s) prête(s) (${(total / 1024 / 1024).toFixed(1)} Mo). Cliquez sur Enregistrer.`,
          );
        }}
      />
      {message && (
        <p className={`mt-2 text-xs ${busy ? "text-stone-ink" : "text-charcoal-soft"}`} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
