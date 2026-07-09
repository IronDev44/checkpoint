# Deploiement Cloudflare Pages

## Etat du projet

Le projet est pret pour Cloudflare Pages :

- build command : `npm run build`
- dossier de sortie : `build`
- fallback SPA : `public/_redirects`
- config Wrangler : `wrangler.toml`

## Methode conseillee : Cloudflare Pages via Git

1. Va dans Cloudflare Dashboard.
2. Ouvre `Workers & Pages`.
3. Cree un projet Pages.
4. Connecte le repo Git du projet.
5. Configure :
   - Framework preset : `Create React App`
   - Build command : `npm run build`
   - Build output directory : `build`
6. Lance le deploiement.

Cloudflare redeploiera automatiquement a chaque push.

## Methode terminal avec Wrangler

Depuis le dossier du projet :

```powershell
npm run build
npx wrangler login
npm run deploy:cloudflare
```

Si ton projet Cloudflare Pages ne s'appelle pas `checkpoint`, modifie le champ
`name` dans `wrangler.toml` avant le deploiement.

Pour tester localement le build Cloudflare :

```powershell
npm run build
npm run preview:cloudflare
```
