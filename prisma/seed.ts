// Demo content: the 6 initial collections (cahier des charges §3) + demo models using the
// inspiration photos in public/images/demo. Every demo item is flagged isDemo / isInspiration,
// so the site labels it and the admin dashboard lists it as "to replace".
// Run: npm run db:seed   (safe to re-run: it only creates what is missing)

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
type T3 = { fr: string; ar: string; en: string };

const categories: { slug: string; name: T3; intro: T3 }[] = [
  {
    slug: "dressings-rangements",
    name: { fr: "Dressings et rangements", ar: "خزائن الملابس ووحدات التخزين", en: "Wardrobes and storage" },
    intro: {
      fr: "Dressings, armoires, placards, bibliothèques et meubles de rangement.",
      ar: "خزائن ملابس، دواليب، خزائن حائطية، مكتبات ووحدات تخزين.",
      en: "Walk-in wardrobes, wardrobes, closets, bookcases and storage furniture.",
    },
  },
  {
    slug: "habillage-mural",
    name: { fr: "Habillage mural et aménagement", ar: "التكسيات الجدارية والتهيئة", en: "Wall panelling and fit-out" },
    intro: {
      fr: "Panneaux décoratifs, habillages muraux et meubles intégrés.",
      ar: "ألواح ديكورية، تكسيات جدارية وأثاث مدمج.",
      en: "Decorative panels, wall panelling and built-in furniture.",
    },
  },
  {
    slug: "lits-chambres",
    name: { fr: "Lits et chambres", ar: "الأسرّة وغرف النوم", en: "Beds and bedrooms" },
    intro: {
      fr: "Lits, têtes de lit, chevets et ensembles coordonnés.",
      ar: "أسرّة، رؤوس أسرّة، كومودينو وأطقم متناسقة.",
      en: "Beds, headboards, nightstands and matching sets.",
    },
  },
  {
    slug: "tables-chaises",
    name: { fr: "Tables et chaises", ar: "الطاولات والكراسي", en: "Tables and chairs" },
    intro: {
      fr: "Tables de repas, tables basses, tables d'appoint et chaises.",
      ar: "طاولات طعام، طاولات منخفضة، طاولات جانبية وكراسي.",
      en: "Dining tables, coffee tables, side tables and chairs.",
    },
  },
  {
    slug: "bureaux-professionnels",
    name: { fr: "Bureaux professionnels", ar: "المكاتب المهنية", en: "Office desks" },
    intro: {
      fr: "Bureaux de direction, postes de travail, caissons et rangements.",
      ar: "مكاتب إدارة، مكاتب عمل، أدراج متنقلة ووحدات تخزين.",
      en: "Executive desks, workstations, pedestals and storage.",
    },
  },
  {
    slug: "tables-reunion",
    name: { fr: "Tables et espaces de réunion", ar: "طاولات وفضاءات الاجتماعات", en: "Meeting tables and rooms" },
    intro: {
      fr: "Tables de réunion, salles de conférence et mobilier de formation.",
      ar: "طاولات اجتماعات، قاعات مؤتمرات وأثاث التكوين.",
      en: "Meeting tables, conference rooms and training furniture.",
    },
  },
];

const D = "/images/demo/";
const products: {
  slug: string;
  category: string;
  availability: string;
  usage: string;
  featured: boolean;
  images: string[];
  name: T3;
  summary: T3;
}[] = [
  {
    slug: "table-de-repas-chene-clair",
    category: "tables-chaises",
    availability: "BOTH",
    usage: "BOTH",
    featured: true,
    images: ["table-chene-1.webp", "table-chene-2.webp"],
    name: { fr: "Table de repas en bois clair", ar: "طاولة طعام من الخشب الفاتح", en: "Light wood dining table" },
    summary: {
      fr: "Une table aux lignes épurées, déclinable selon vos dimensions.",
      ar: "طاولة بخطوط بسيطة، يمكن تنفيذها وفق مقاساتكم.",
      en: "A table with clean lines, available in your dimensions.",
    },
  },
  {
    slug: "banc-bois-teinte-noire",
    category: "tables-chaises",
    availability: "STANDARD",
    usage: "RESIDENTIAL",
    featured: false,
    images: ["banc-noir-1.webp"],
    name: { fr: "Banc en bois teinte noire", ar: "مقعد خشبي بلون أسود", en: "Black-stained wooden bench" },
    summary: {
      fr: "Un banc sobre pour accompagner une table de repas.",
      ar: "مقعد بسيط يرافق طاولة الطعام.",
      en: "A simple bench to go with a dining table.",
    },
  },
  {
    slug: "ensemble-repas-teinte-noire",
    category: "tables-chaises",
    availability: "STANDARD",
    usage: "BOTH",
    featured: false,
    images: ["ensemble-noir-1.webp"],
    name: { fr: "Ensemble table et chaises teinte noire", ar: "طقم طاولة وكراسي بلون أسود", en: "Black-stained table and chairs set" },
    summary: {
      fr: "Table et chaises coordonnées pour la salle à manger.",
      ar: "طاولة وكراسي متناسقة لغرفة الطعام.",
      en: "Matching table and chairs for the dining room.",
    },
  },
  {
    slug: "chevet-deux-tiroirs",
    category: "lits-chambres",
    availability: "STANDARD",
    usage: "RESIDENTIAL",
    featured: true,
    images: ["chevet-1.webp", "chevet-2.webp", "chevet-3.webp", "chevet-4.webp", "chevet-5.webp"],
    name: { fr: "Chevet à deux tiroirs", ar: "كومودينو بدرجين", en: "Two-drawer nightstand" },
    summary: {
      fr: "Une niche ouverte et deux tiroirs pour l'essentiel à portée de main.",
      ar: "رفّ مفتوح ودرجان لتكون الأشياء الأساسية في متناول اليد.",
      en: "An open niche and two drawers to keep essentials within reach.",
    },
  },
  {
    slug: "buffet-portes-cannees",
    category: "dressings-rangements",
    availability: "BOTH",
    usage: "BOTH",
    featured: true,
    images: ["buffet-canne-1.webp", "buffet-canne-2.webp", "buffet-canne-3.webp"],
    name: { fr: "Buffet à portes cannées", ar: "بوفيه بأبواب من القصب", en: "Cane-door sideboard" },
    summary: {
      fr: "Un meuble de rangement bas à quatre portes, pour le séjour ou le bureau.",
      ar: "وحدة تخزين منخفضة بأربعة أبواب، لغرفة الجلوس أو المكتب.",
      en: "A low four-door storage piece for the living room or office.",
    },
  },
  {
    slug: "bureau-direction-arrondi",
    category: "bureaux-professionnels",
    availability: "CUSTOM",
    usage: "PROFESSIONAL",
    featured: true,
    images: ["bureau-1.webp", "bureau-2.webp"],
    name: { fr: "Bureau de direction aux angles arrondis", ar: "مكتب إدارة بزوايا مستديرة", en: "Rounded executive desk" },
    summary: {
      fr: "Tiroirs, niche de rangement et piètement plein aux formes arrondies.",
      ar: "أدراج، رفّ للتخزين وقاعدة مصمتة بأشكال مستديرة.",
      en: "Drawers, a storage niche and a solid rounded base.",
    },
  },
];

const projects: { slug: string; spaceType: string; images: string[]; title: T3; summary: T3; description: T3 }[] = [
  {
    slug: "exemple-salle-a-manger",
    spaceType: "RESIDENTIAL",
    images: ["table-chene-1.webp", "table-chene-2.webp"],
    title: { fr: "Exemple : salle à manger en bois clair", ar: "مثال: غرفة طعام بالخشب الفاتح", en: "Example: light wood dining room" },
    summary: {
      fr: "Mise en page d'exemple pour une réalisation résidentielle.",
      ar: "صفحة مثال لعرض إنجاز سكني.",
      en: "Sample layout for a residential project.",
    },
    description: {
      fr: "Cette fiche montre comment une réalisation sera présentée : contexte du projet, besoins du client, meubles fabriqués et photos du résultat. Elle sera remplacée par un projet AmenPlus réel.",
      ar: "توضّح هذه الصفحة طريقة عرض الإنجاز: سياق المشروع، حاجيات الحريف، الأثاث المصنوع وصور النتيجة. وستُستبدل بمشروع حقيقي من AmenPlus.",
      en: "This page shows how a project will be presented: context, client needs, furniture made and photos of the result. It will be replaced by a real AmenPlus project.",
    },
  },
  {
    slug: "exemple-bureau-direction",
    spaceType: "OFFICE",
    images: ["bureau-1.webp", "bureau-2.webp"],
    title: { fr: "Exemple : bureau de direction", ar: "مثال: مكتب إدارة", en: "Example: executive office" },
    summary: {
      fr: "Mise en page d'exemple pour une réalisation professionnelle.",
      ar: "صفحة مثال لعرض إنجاز مهني.",
      en: "Sample layout for a professional project.",
    },
    description: {
      fr: "Cette fiche montre comment un projet professionnel sera présenté. Elle sera remplacée par une réalisation AmenPlus réelle, publiée avec l'accord du client.",
      ar: "توضّح هذه الصفحة طريقة عرض مشروع مهني، وستُستبدل بإنجاز حقيقي من AmenPlus يُنشر بموافقة الحريف.",
      en: "This page shows how a professional project will be presented. It will be replaced by a real AmenPlus project, published with the client's consent.",
    },
  },
];

const locales = ["fr", "ar", "en"] as const;

async function main() {
  for (const [i, c] of categories.entries()) {
    const exists = await db.category.findUnique({ where: { slug: c.slug } });
    if (exists) continue;
    await db.category.create({
      data: {
        slug: c.slug,
        order: i,
        translations: { create: locales.map((l) => ({ locale: l, name: c.name[l], intro: c.intro[l] })) },
      },
    });
  }

  for (const [i, p] of products.entries()) {
    if (await db.product.findUnique({ where: { slug: p.slug } })) continue;
    const cat = await db.category.findUniqueOrThrow({ where: { slug: p.category } });
    await db.product.create({
      data: {
        slug: p.slug,
        categoryId: cat.id,
        availability: p.availability,
        usage: p.usage,
        featured: p.featured,
        isDemo: true,
        order: i,
        translations: { create: locales.map((l) => ({ locale: l, name: p.name[l], summary: p.summary[l] })) },
        images: { create: p.images.map((img, j) => ({ url: D + img, order: j, isInspiration: true })) },
      },
    });
  }

  for (const [i, p] of projects.entries()) {
    if (await db.project.findUnique({ where: { slug: p.slug } })) continue;
    await db.project.create({
      data: {
        slug: p.slug,
        spaceType: p.spaceType,
        isDemo: true,
        order: i,
        translations: {
          create: locales.map((l) => ({ locale: l, title: p.title[l], summary: p.summary[l], description: p.description[l] })),
        },
        images: { create: p.images.map((img, j) => ({ url: D + img, order: j, isInspiration: true })) },
      },
    });
  }

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
