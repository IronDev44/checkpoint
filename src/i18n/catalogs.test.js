import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

const placeholders=value=>[...value.matchAll(/\{\{(\d+)\}\}/g)].map(match=>match[1]).sort().join(',');
test.each(Object.entries({en,es,de,it,pt}))('%s has every source message and preserves interpolation values',(language,catalog)=>{
 const errors=[];
 for(const source of Object.keys(fr)){
  const translation=catalog[source];
  if(typeof translation!=='string'||!translation.trim()||placeholders(source)!==placeholders(translation)||/ZXQ\d+QXZ|\[\[CP\d+\]\]/.test(translation))errors.push(source);
 }
 expect(errors).toEqual([]);
});
