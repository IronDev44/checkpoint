const fs = require('fs');
const path = require('path');
async function main() {
  const session = JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE, '.config/configstore/firebase-tools.json')));
  const headers = { Authorization: `Bearer ${session.tokens.access_token}` };
  for (const [name, url] of [
    ['authentication', 'https://identitytoolkit.googleapis.com/admin/v2/projects/game-tracker-a1e22/config'],
    ['rules', 'https://firebaserules.googleapis.com/v1/projects/game-tracker-a1e22/releases'],
    ['users', 'https://identitytoolkit.googleapis.com/v1/projects/game-tracker-a1e22/accounts:batchGet?maxResults=10'],
    ['google', 'https://identitytoolkit.googleapis.com/admin/v2/projects/game-tracker-a1e22/defaultSupportedIdpConfigs/google.com'],
  ]) {
    const response = await fetch(url, { headers }); const data = await response.json();
    if (name === 'authentication' && response.ok) console.log(name, JSON.stringify({emailEnabled:data.signIn?.email?.enabled, authorizedDomains:data.authorizedDomains}));
    else if (name === 'users' && response.ok) console.log(name, JSON.stringify((data.users || []).map(u => ({uid:u.localId,email:u.email}))));
    else if (name === 'google' && response.ok) console.log(name, JSON.stringify({enabled:data.enabled,hasClientId:!!data.clientId}));
    else console.log(name, response.status, JSON.stringify(data));
  }
}
main().catch(() => { console.error('Impossible de lire la configuration Firebase.'); process.exitCode = 1; });
