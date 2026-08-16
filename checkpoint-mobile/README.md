# Checkpoint Mobile

Base Expo + React Native pour migrer Checkpoint progressivement sans casser la version web existante.

## Commandes

```bash
npm install
npm run start
npm run ios
npm run android
npm run web
npm run build:web
npm run typecheck
```

## Principe

- L'app web historique reste à la racine du dépôt.
- Cette app mobile vit dans `checkpoint-mobile`.
- Firebase est branché en lecture pour valider la connexion.
- Les écrans sont volontairement simples : ils servent de socle avant migration progressive des vrais composants.
