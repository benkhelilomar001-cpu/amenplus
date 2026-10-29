import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminTitle, Flash, sp } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produits" };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const products = await db.product.findMany({
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    include: {
      translations: { where: { locale: "fr" } },
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { include: { translations: { where: { locale: "fr" } } } },
      _count: { select: { translations: true, images: true } },
    },
  });

  return (
    <>
      <AdminTitle title="Produits">
        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          Nouveau produit
        </Link>
      </AdminTitle>
      <Flash deleted={sp(params.deleted) === "1"} />
      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-ivory text-xs uppercase tracking-wide text-stone-ink">
            <tr>
              <th className="px-4 py-3 text-start font-medium">Produit</th>
              <th className="px-4 py-3 text-start font-medium">Collection</th>
              <th className="px-4 py-3 text-start font-medium">Langues</th>
              <th className="px-4 py-3 text-start font-medium">Photos</th>
              <th className="px-4 py-3 text-start font-medium">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3 font-medium hover:text-wood-ink">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-ivory">
                      {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    {p.translations[0]?.name ?? p.slug}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.category.translations[0]?.name}</td>
                <td className="px-4 py-3">{p._count.translations}/3</td>
                <td className="px-4 py-3">{p._count.images}</td>
                <td className="space-x-1 px-4 py-3">
                  {!p.visible && <span className="bg-[#eee] px-1.5 py-0.5 text-xs">Masqué</span>}
                  {p.featured && <span className="bg-ivory-deep px-1.5 py-0.5 text-xs">À la une</span>}
                  {p.isDemo && <span className="bg-[#f6e3c8] px-1.5 py-0.5 text-xs text-[#7a4a12]">Démo</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
