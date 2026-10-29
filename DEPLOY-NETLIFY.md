# Mettre le site en ligne gratuitement (GitHub + Netlify + Neon)

Résultat : une adresse du type **https://amenplus.netlify.app**, en ligne en permanence. Chaque fois que le code est poussé sur GitHub, le site se met à jour tout seul.

| Service | Rôle | Plan gratuit |
| --- | --- | --- |
| GitHub | Stocke le code (dépôt **privé**) | Gratuit |
| Netlify | Héberge le site, et les photos et pièces jointes (Netlify Blobs) | Gratuit, usage commercial autorisé |
| Neon | Base de données Postgres | Gratuit, 0,5 Go |

---

## 1. Neon : la base de données (5 min)

1. Créez un compte sur https://neon.tech (connexion avec GitHub possible).
2. **Create project** : nom `amenplus`, région **AWS Europe (Frankfurt)**, la plus proche de la Tunisie.
3. Sur le tableau de bord, cliquez sur **Connect**. Vous avez besoin de deux adresses :
   - **Connection pooling activé**, l'hôte contient `-pooler` : c'est `DATABASE_URL`. Ajoutez `&pgbouncer=true` à la fin.
   - **Connection pooling désactivé** : c'est `DIRECT_URL`.
4. Collez-les dans le fichier `netlify.env` (dans ce dossier, déjà préparé et exclu de git), à la place de `COLLER_ICI_…`.

## 2. GitHub : le code (5 min)

1. Créez un compte sur https://github.com, puis un **nouveau dépôt** : nom `amenplus`, visibilité **Private**, sans README.
2. Copiez l'adresse du dépôt (`https://github.com/<votre-compte>/amenplus.git`), puis poussez le code :

```bash
git -C AMENPLUS/site remote add origin https://github.com/VOTRE-COMPTE/amenplus.git
```
```bash
git -C AMENPLUS/site push -u origin feat/site-amenplus:main
```

Une fenêtre GitHub s'ouvre pour vous connecter la première fois.

## 3. Netlify : la mise en ligne (10 min)

1. Créez un compte sur https://netlify.com (**Sign up with GitHub**).
2. **Add new project → Import an existing project → GitHub**, puis choisissez `amenplus`. Autorisez l'accès à ce dépôt uniquement.
3. Laissez les réglages proposés : Netlify lit `netlify.toml`, la commande de build est `npm run build`.
4. **Avant de lancer le déploiement** (ou juste après, puis relancez-le) : allez dans **Site configuration → Environment variables → Import from a .env file**, collez le contenu de `netlify.env`, puis **Import variables**.
5. **Deploys → Trigger deploy → Deploy site**. Le build crée aussi les tables dans Neon.
6. Pour une adresse plus lisible : **Site configuration → Change site name** → `amenplus`, ce qui donne https://amenplus.netlify.app. Si vous changez le nom, mettez à jour `SITE_URL` dans les variables Netlify.

## 4. Remplir la base avec les collections et les contenus de démonstration (1 min)

Une seule fois, depuis ce PC, après le premier déploiement (qui crée les tables). La commande lit les adresses Neon dans `netlify.env` :

```bash
npm --prefix AMENPLUS/site run db:seed:netlify
```

(Ou demandez à Claude de le faire une fois `netlify.env` rempli.)

## 5. Vérifier

- https://amenplus.netlify.app/fr, /ar et /en s'affichent.
- Envoyez une demande de devis avec une photo, elle apparaît dans `/admin/demandes`.
- Le mot de passe admin est `ADMIN_PASSWORD` dans `netlify.env`. Il est différent du mot de passe local ; gardez-le en lieu sûr.

---

## Bon à savoir

- **Limite d'envoi :** Netlify refuse les requêtes de plus de ~6 Mo. Les photos sont donc allégées automatiquement dans le navigateur, et chaque envoi est limité à 4 Mo (formulaire de devis et admin).
- **Anti-spam :** le compteur de demandes par visiteur est en mémoire, donc moins strict sur Netlify (plusieurs serveurs). Le piège à robots et le délai minimum restent actifs.
- **Mises en veille Neon :** la base gratuite s'endort après 5 min sans activité. La première visite qui suit peut prendre 1 à 2 secondes de plus.
- **Nom de domaine :** plus tard, **Domain management → Add a domain** (ex. `amenplus.tn`), puis mettez `SITE_URL` à jour.
- **Photos de démonstration :** ce sont des photos d'autres marques. Le site est en ligne mais pas encore annoncé ; remplacez-les avant de diffuser l'adresse largement.
