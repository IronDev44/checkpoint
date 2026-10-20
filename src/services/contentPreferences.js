export const CONTENT_TABS={home:'Accueil',library:'Bibliothèque',search:'Recherche',arena:'L’Arène',profile:'Profil',hardware:'Matériel',social:'Social',series:'Séries',favorites:'Sanctuaire',top5:'Top 5',upcoming:'Sorties',deals:'Promos',news:'Actu',live:'Live',options:'Options'};
export const REQUIRED_TABS=['home','options'];
export function normalizeHiddenTabs(value){return [...new Set((Array.isArray(value)?value:[]).filter(id=>Object.hasOwn(CONTENT_TABS,id)&&!REQUIRED_TABS.includes(id)))];}
