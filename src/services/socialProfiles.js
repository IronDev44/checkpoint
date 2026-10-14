export async function readPublicSocialProfile(value, readDocument) {
  const handle = String(value || "").trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(handle)) throw new Error("Entre un identifiant Checkpoint valide.");
  const snapshot = await readDocument(handle);
  if (!snapshot.exists()) throw new Error("Ce profil n’est plus disponible ou est privé.");
  const profile = snapshot.data();
  if (profile.visibility && profile.visibility !== "public") throw new Error("Ce profil est privé.");
  return { ...profile, handle };
}

export function getFriendsFeed(profiles) {
  return profiles.flatMap(profile => profile.publicSections?.activity === false ? [] :
    (profile.recentActivity || []).map((activity, index) => ({ ...activity, profile,
      feedId: `${profile.handle}:${activity.id || index}`,
    }))).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}
