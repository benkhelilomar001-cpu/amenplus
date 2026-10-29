import Image from "next/image";
import { ArrowDown, ArrowUp, Sparkles, Trash2 } from "lucide-react";
import { imageAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "./ConfirmSubmit";

type Img = { id: string; url: string; isInspiration: boolean };

/** Photo list with reorder / delete / "inspiration" toggle. Each button is its own small form. */
export function ImageManager({ owner, ownerId, images }: { owner: "product" | "project"; ownerId: string; images: Img[] }) {
  if (images.length === 0) return <p className="text-sm text-stone-ink">Aucune photo pour le moment.</p>;
  const btn = "inline-flex h-8 w-8 items-center justify-center border border-line bg-white hover:bg-ivory disabled:opacity-30";
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {images.map((img, i) => (
        <li key={img.id} className="border border-line bg-white">
          <div className="relative aspect-square bg-ivory">
            <Image src={img.url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
            {i === 0 && <span className="absolute start-1 top-1 bg-charcoal px-1.5 py-0.5 text-[0.65rem] text-ivory">Principale</span>}
            {img.isInspiration && (
              <span className="absolute bottom-1 start-1 bg-[#f6e3c8] px-1.5 py-0.5 text-[0.65rem] text-[#7a4a12]">Inspiration</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 p-2">
            {(
              [
                { op: "up", icon: ArrowUp, label: "Monter", disabled: i === 0 },
                { op: "down", icon: ArrowDown, label: "Descendre", disabled: i === images.length - 1 },
                { op: "inspiration", icon: Sparkles, label: img.isInspiration ? "Marquer comme photo AmenPlus" : "Marquer comme visuel d'inspiration", disabled: false },
              ] as const
            ).map(({ op, icon: Icon, label, disabled }) => (
              <form key={op} action={imageAction}>
                <input type="hidden" name="owner" value={owner} />
                <input type="hidden" name="ownerId" value={ownerId} />
                <input type="hidden" name="imageId" value={img.id} />
                <input type="hidden" name="op" value={op} />
                <button type="submit" className={btn} disabled={disabled} title={label} aria-label={label}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            ))}
            <form action={imageAction} className="ms-auto">
              <input type="hidden" name="owner" value={owner} />
              <input type="hidden" name="ownerId" value={ownerId} />
              <input type="hidden" name="imageId" value={img.id} />
              <input type="hidden" name="op" value="delete" />
              <ConfirmSubmit message="Supprimer cette photo ?" className={`${btn} text-danger`}>
                <Trash2 className="h-4 w-4" aria-label="Supprimer" />
              </ConfirmSubmit>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
