// The visible name is free to change; the share address is allocated once.
export function automaticProfileHandle(displayName, owner, attempt = 0) {
  if (!owner) throw new Error('Connecte-toi pour activer ton profil.');
  const slug = String(displayName).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16) || 'joueur';
  const suffix = String(owner).replace(/[^a-zA-Z0-9]/g, '').slice(-12).toLowerCase();
  if (!suffix) throw new Error('Connecte-toi pour activer ton profil.');
  return `${slug}-${suffix}${attempt ? `-${attempt + 1}` : ''}`;
}

export async function publishProfileWithIdentity({profile, owner, write}) {
  if (profile.handle) {
    await write(profile);
    return profile.handle;
  }
  for (let attempt = 0; attempt < 10; attempt++) {
    const handle = automaticProfileHandle(profile.displayName, owner, attempt);
    try {
      // The server only creates an unused address or updates this owner's profile.
      await write({...profile, handle});
      return handle;
    } catch (error) {
      if (![403, 409].includes(error.status) || attempt === 9) throw error;
    }
  }
}
