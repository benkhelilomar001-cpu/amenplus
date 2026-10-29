import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminTitle, Flash, sp } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réalisations" };

const SPACE: Record<string, string> = { RESIDENTIAL: "Résidentiel", OFFICE: "Bureaux", HOSPITALITY: "Hôtellerie et commerces", OTHER: "Autres" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const projects = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { translations: { where: { locale: "fr" } }, _count: { select: { images: true } } },
  });
  return (
    <>
      <AdminTitle title="Réalisations">
        <Link href="/admin/realisations/nouveau" className="btn btn-primary">
          Nouvelle réalisation
        </Link>
      </AdminTitle>
      <Flash deleted={sp(params.deleted) === "1"} />
      {projects.length === 0 ? (
        <p className="border border-line bg-white p-6 text-sm text-stone-ink">Aucune réalisation.</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/realisations/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper">
                <span className="font-medium">{p.translations[0]?.title ?? p.slug}</span>
                <span className="space-x-2 text-sm text-stone-ink">
                  <span>{SPACE[p.spaceType]}</span>
                  <span>· {p._count.images} photo(s)</span>
                  {!p.visible && <span>· masquée</span>}
                  {p.isDemo && <span className="bg-[#f6e3c8] px-1.5 py-0.5 text-xs text-[#7a4a12]">Exemple</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
