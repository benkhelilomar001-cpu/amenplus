# AmenPlus — site vitrine trilingue avec demandes de devis

Site premium pour AmenPlus, fabricant de mobilier en bois à La Soukra (Tunisie).
**Modèle commercial : devis uniquement.** Aucun prix public, aucun paiement en ligne.

- **Langues :** français (`/fr`), arabe en RTL (`/ar`), anglais (`/en`). La langue est détectée à l'arrivée sur `/`.
- **Parcours devis :** le visiteur ajoute un ou plusieurs modèles à sa demande (quantité indicative et précision par modèle), puis remplit un formulaire avec pièces jointes (3 fichiers max., 8 Mo chacun, JPG/PNG/WebP/PDF).
- **Administration `/admin` :** demandes (statuts, notes internes, pièces jointes, export CSV), produits, collections, réalisations, coordonnées et photos de l'accueil, en trois langues.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · next-intl (traductions résolues côté serveur) · Prisma (SQLite en local, Postgres conseillé en production) · Zod (validation identique côté navigateur et côté serveur) · Motion · Lucide.

Pourquoi pas WordPress + WooCommerce comme le suggère le cahier des charges ? PHP n'était pas disponible pour tester, et cette stack couvre les mêmes besoins (catalogue, devis multi-produits, trilingue + RTL, admin) sans extensions payantes (WPML, plugin de devis), avec de meilleures performances.

## Lancer en local

```bash
npm install
npx prisma db push      # crée la base SQLite prisma/dev.db
npm run db:seed         # 6 collections + contenus de démonstration
npm run dev             # http://localhost:3000
```

L'admin est sur http://localhost:3000/admin. Le mot de passe local est dans `.env` (`ADMIN_PASSWORD`).

Autres commandes : `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`, `npm run db:studio` (explorateur de base de données).

## Variables d'environnement

Voir `.env.example`.

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Base de données |
| `SITE_URL` | URL publique (sitemap, balises canonical, hreflang, Open Graph) |
| `ADMIN_PASSWORD` | Mot de passe de `/admin` (long et aléatoire) |
| `ADMIN_SESSION_SECRET` | Clé de signature des sessions admin (64 caractères hexadécimaux) |
| `STORAGE_DIR` | Dossier des photos envoyées et des pièces jointes (doit être conservé et sauvegardé) |
| `RESEND_API_KEY`, `MAIL_FROM` | Facultatif : e-mail à l'équipe à chaque nouvelle demande, via [Resend](https://resend.com) |
| `QUOTE_NOTIFY_TO` | Facultatif : destinataires (sinon, ceux saisis dans Admin → Paramètres) |

Sans e-mail configuré, les demandes sont quand même enregistrées et visibles dans l'admin. **Aucun e-mail ne part tant que les adresses officielles ne sont pas renseignées.**

## Mise en ligne

**Option conseillée : un petit serveur Node (VPS).** Le site fonctionne tel quel :

```bash
npm ci && npx prisma db push && npm run build && npm start
```

Placez-le derrière Nginx ou Caddy (HTTPS), avec un gestionnaire de processus (pm2 ou systemd). Sauvegardez chaque jour `prisma/dev.db` (ou la base Postgres) et le dossier `storage/`.

**Hébergement serverless (Vercel, Netlify…)** : il faut deux changements, car le disque n'y est pas persistant.
1. Postgres (Neon, Supabase…) : dans `prisma/schema.prisma`, mettre `provider = "postgresql"`, puis renseigner `DATABASE_URL`.
2. Stockage objet (S3, Cloudflare R2…) : remplacer les fonctions de `lib/storage.ts`, qui sont isolées pour ça.

Le limiteur anti-spam (`lib/rate-limit.ts`) est en mémoire. En multi-instance, il faut le brancher sur Redis.

## Organisation du code

```
app/[locale]/        pages publiques (accueil, collections, produits, devis, réalisations…)
app/admin/           administration + actions serveur (actions.ts)
app/api/quote/       réception des demandes (validation, anti-spam, fichiers, référence AP-AAAA-NNNN)
app/api/admin/       téléchargement des pièces jointes, export CSV (admin uniquement)
app/media/           service des photos envoyées depuis l'admin
components/          interface (layout, catalogue, formulaire de devis, admin)
content/legal.ts     modèles des pages légales (FR/AR/EN)
lib/                 base de données, contenus, sessions, validation, stockage, e-mail
messages/*.json      textes de l'interface en FR / AR / EN
prisma/              schéma + données de démonstration
public/brand/        logo SVG (horizontal, clair, monochrome, monogramme, favicon)
```

## Remplacer les contenus de démonstration

Tout se fait dans l'admin, sans toucher au code. Le **tableau de bord** liste ce qui reste à faire.

1. **Produits** : décocher « Fiche de démonstration », remplacer les photos (ou décocher « visuel d'inspiration » sur une vraie photo AmenPlus) et ne renseigner dimensions et matériaux qu'une fois confirmés. Un champ vide n'est pas affiché.
2. **Réalisations** : supprimer les deux exemples et publier de vrais projets, avec l'accord des clients.
3. **Paramètres** : coordonnées officielles, adresse, horaires, réseaux sociaux, e-mails de notification et 3 photos de l'accueil.
4. **Pages légales** : compléter les `[crochets]` dans `content/legal.ts` et faire valider les textes par un juriste (droit tunisien, loi organique n° 2004-63).

## ⚠️ Photos de démonstration

Les photos de `public/images/demo/` (fournies pour la maquette) sont des **photos produits d'autres marques** (meubles Ethnicraft, Four Hands…). Le site les signale comme « Visuel d'inspiration », mais **elles ne doivent pas rester en ligne** : elles ne montrent pas des meubles AmenPlus et ne sont pas libres de droits. Il faut les remplacer par les photos d'AmenPlus avant la mise en ligne publique, puis supprimer le dossier.

## Informations à obtenir d'AmenPlus

- [ ] Logo final validé (le logo du site est une recréation vectorielle du concept, à faire valider ; le mot AMENPLUS des fichiers SVG utilise la police Jost et doit être vectorisé)
- [ ] Photos originales des produits, de l'atelier et des réalisations, avec droits d'utilisation
- [ ] Liste des produits réellement fabriqués : noms, références, dimensions, matériaux, finitions
- [ ] Confirmation des 6 collections (habillage mural, tables de réunion : prestations proposées ?)
- [ ] Coordonnées officielles : téléphone, WhatsApp, e-mail, adresse exacte, horaires
- [ ] Adresse(s) e-mail de réception des demandes + domaine d'envoi (pour `MAIL_FROM`)
- [ ] Règles de livraison en Tunisie : zones, frais, délais, installation, montage
- [ ] Garantie, service après-vente, validité des devis, acompte
- [ ] Texte de présentation de l'entreprise (histoire, atelier, équipe)
- [ ] Informations légales : forme juridique, identifiant unique, responsable de publication, hébergeur
- [ ] Validation des traductions arabe et anglaise
- [ ] Nom de domaine et hébergement

## Vérifié avant livraison

- Les 15 pages répondent dans les 3 langues (45 URL) ; une page inconnue renvoie une 404 traduite.
- Arabe : `dir="rtl"`, mise en page inversée, flèches retournées, police IBM Plex Sans Arabic ; pas de défilement horizontal sur mobile.
- Parcours complet testé sur mobile : ajout au panier, erreurs de formulaire (toutes affichées en même temps), envoi avec pièce jointe, référence AP-2026-0001 enregistrée, fichier stocké hors du dossier public.
- Admin : redirection vers la connexion, changement de statut, note interne, modification d'un produit visible tout de suite sur le site.
- `npm run build`, `tsc` et ESLint passent.
- **Pas encore fait :** test Lighthouse, test de l'envoi d'e-mails (aucune clé configurée), test sur un vrai téléphone.
