# AmenPlus — site vitrine trilingue avec demandes de devis

Site premium pour AmenPlus, fabricant de mobilier en bois à La Soukra (Tunisie).
**Modèle commercial : devis uniquement.** Aucun prix public, aucun paiement en ligne.

- **Langues :** français (`/fr`), arabe en RTL (`/ar`), anglais (`/en`). La langue est détectée à l'arrivée sur `/`.
- **Parcours devis :** le visiteur ajoute un ou plusieurs modèles à sa demande (quantité indicative et précision par modèle), puis remplit un formulaire avec pièces jointes (3 fichiers max., 8 Mo chacun, JPG/PNG/WebP/PDF).
- **Administration `/admin` :** demandes (statuts, notes internes, pièces jointes, export CSV), produits, collections, réalisations, coordonnées et photos de l'accueil, en trois langues.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · next-intl (traductions résolues côté serveur) · Prisma + Postgres (Neon en production, PGlite en local) · Netlify + Netlify Blobs · Zod (validation identique côté navigateur et côté serveur) · Motion · Lucide.

Pourquoi pas WordPress + WooCommerce comme le suggère le cahier des charges ? PHP n'était pas disponible pour tester, et cette stack couvre les mêmes besoins (catalogue, devis multi-produits, trilingue + RTL, admin) sans extensions payantes (WPML, plugin de devis), avec de meilleures performances.

## Lancer en local

Il faut deux terminaux :

```bash
npm run db:local        # terminal 1 : Postgres local (PGlite, données dans .pglite/), à laisser ouvert
```
```bash
npm install && npm run db:migrate && npm run db:seed && npm run dev   # terminal 2 : http://localhost:3000
```

`db:migrate` crée les tables et `db:seed` ajoute les 6 collections et les contenus de démonstration. Dans `.env`, les adresses locales se terminent par `&pgbouncer=true`, que PGlite exige.

L'admin est sur http://localhost:3000/admin. Le mot de passe local est dans `.env` (`ADMIN_PASSWORD`).

Autres commandes : `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`, `npm run db:studio` (explorateur de base de données).

## Variables d'environnement

Voir `.env.example`.

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Base Postgres (Neon : adresse avec `-pooler`) |
| `DIRECT_URL` | Base Postgres, adresse directe (utilisée par les migrations) |
| `STORAGE_DRIVER` | `netlify` sur Netlify (fichiers dans Netlify Blobs), vide sinon |
| `SITE_URL` | URL publique (sitemap, balises canonical, hreflang, Open Graph) |
| `ADMIN_PASSWORD` | Mot de passe de `/admin` (long et aléatoire) |
| `ADMIN_SESSION_SECRET` | Clé de signature des sessions admin (64 caractères hexadécimaux) |
| `STORAGE_DIR` | Dossier des photos envoyées et des pièces jointes (doit être conservé et sauvegardé) |
| `RESEND_API_KEY`, `MAIL_FROM` | Facultatif : e-mail à l'équipe à chaque nouvelle demande, via [Resend](https://resend.com) |
| `QUOTE_NOTIFY_TO` | Facultatif : destinataires (sinon, ceux saisis dans Admin → Paramètres) |

Sans e-mail configuré, les demandes sont quand même enregistrées et visibles dans l'admin. **Aucun e-mail ne part tant que les adresses officielles ne sont pas renseignées.**

## Mise en ligne

**Gratuit : GitHub + Netlify + Neon.** Tout est prêt : `netlify.toml`, la migration `prisma/migrations/0_init` et le stockage Netlify Blobs. Le pas-à-pas est dans **[DEPLOY-NETLIFY.md](DEPLOY-NETLIFY.md)**, et les variables à importer dans Netlify sont dans `netlify.env` (fichier local, exclu de git).

**Plus tard, sur un VPS** : `npm ci && npm run build && npm start` derrière Nginx ou Caddy, avec une base Postgres et `STORAGE_DRIVER` vide (les fichiers vont alors dans `STORAGE_DIR`, à sauvegarder).

Les envois sont limités à 4 Mo par requête (limite Netlify de ~6 Mo) ; les photos sont allégées dans le navigateur (`lib/compress-image.ts`). Le limiteur anti-spam (`lib/rate-limit.ts`) est en mémoire : en multi-instance, il faut le brancher sur Redis.

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
- Postgres (PGlite local) : build de production, demande de devis avec une photo de 46 Mo réduite à 1,2 Mo, ajout de photo depuis l'admin.
- **Pas encore fait :** déploiement réel sur Netlify + Neon, test Lighthouse, envoi d'e-mails (aucune clé configurée), test sur un vrai téléphone.
