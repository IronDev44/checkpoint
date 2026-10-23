const fs=require('node:fs');
fs.copyFileSync('src/services/rendezvousCatalog.js','public/rendezvous-catalog.js');
fs.copyFileSync('src/services/publicProfilePrivacy.js','public/profile-privacy.js');

fs.copyFileSync('src/services/arenaVariants.js','public/arena-variants.js');
fs.writeFileSync('public/arena-duel.js',fs.readFileSync('src/services/soloDuel.js','utf8').replace("'./arenaVariants'","'./arena-variants.js'"));
fs.writeFileSync('public/arena-state.js',fs.readFileSync('src/services/arenaState.js','utf8').replace("'./soloDuel'","'./arena-duel.js'"));
