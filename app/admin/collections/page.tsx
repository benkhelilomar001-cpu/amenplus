import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections" };

export default async function CollectionsAdmin() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { translations: { where: { locale: "fr" } }, _count: { select: { products: true } } },
  });
  return (
    <>
      <AdminTitle title="Collections">
        <Link href="/admin/collections/nouveau" className="btn btn-primary">
          Nouvelle collection
        </Link>
      </AdminTitle>
      <ul className="divide-y divide-line border border-line bg-white">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/collections/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper">
              <span>
                <span className="font-medium">{c.translations[0]?.name ?? c.slug}</span>
                <span className="block text-xs text-stone-ink">/{c.slug}</span>
              </span>
              <span className="text-sm text-stone-ink">
                {c._count.products} produit(s){!c.visible && " · masquée"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
