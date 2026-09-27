# Entre Terre et Ciel — code source complet

Plateforme responsive en français pour ETEC asbl, Kinshasa et Lubumbashi. Cette archive contient l’interface, le formulaire de demandes, l’API de soumission et la migration SQLite/D1.

## Fonctionnalités
- Présentation et parcours : achat d’espace, accompagnement des funérailles, diaspora.
- Choix de la ville, indication facultative du site, questions fréquentes.
- Demande de renseignements, signalement et réclamation.
- Enregistrement des demandes en D1 avec référence `ETEC-AAAA-XXXXXXXX` et état initial `nouveau`.
- Aucun paiement, réservation ferme, notification automatique ou espace administrateur n’est inclus dans cette version.

## Structure utile
- `app/page.tsx` : page et interactions.
- `app/globals.css` : identité visuelle et responsive.
- `app/api/demandes/route.ts` : validation et création d’une demande.
- `db/schema.ts` : modèle de données.
- `drizzle/` : migration initiale à appliquer avant la mise en service.
- `.openai/hosting.json` : configuration logique D1, sans identifiant de projet.
- `public/favicon.svg` : icône.

## Installation et vérification
Prérequis : Node.js >= 22.13 et pnpm récent.

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build
```

Ce projet utilise Vinext/React et une base Cloudflare D1 accessible côté serveur. La migration `drizzle/0000_next_roxanne_simpson.sql` doit être exécutée sur la base D1 liée comme `DB` avant d’utiliser le formulaire. Pour un hébergement hors Cloudflare/Sites, adapter l’accès à la base dans `app/api/demandes/route.ts` et la configuration de compilation/déploiement.

## Points à compléter avant ouverture publique
1. Ajouter la liste officielle et les coordonnées de chaque site à Kinshasa et Lubumbashi.
2. Faire valider les informations commerciales, les conditions d’achat et les textes de confidentialité par ETEC.
3. Mettre en place l’interface ou la procédure interne de traitement des demandes, ainsi que les notifications à l’équipe.
4. Définir les règles de conservation, d’accès et de suppression des coordonnées et messages.
5. Remplacer ou intégrer le logo officiel dans une version vectorielle/haute définition validée.
6. Tester les formulaires, l’accessibilité et les parcours mobiles sur l’hébergement cible.

Le site de démonstration est privé : son adresse et son identifiant de déploiement ne sont pas requis pour utiliser ce code.
