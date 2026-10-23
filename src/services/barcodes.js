export function normalizeBarcode(value){
 const code=String(value??'').replace(/[\s-]/g,'');
 if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code))return null;
 let sum=0;for(let i=code.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(code[i])*weight;
 return (10-sum%10)%10===Number(code.at(-1))?code:null;
}
export const barcodeKey=value=>{const code=normalizeBarcode(value);return code?code.padStart(14,'0'):null;};
export function barcodeSearchTitle(value){
 return String(value||'').replace(/\b(?:sony\s+)?playstation\s*[1-5]?\b|\bps\s*[1-5]\b|\bxbox\s*(?:one|360|series\s*[xs](?:\s*[/|]\s*[xs])?)?\b|\bnintendo\s+(?:switch\s*2?|wii\s*u?|3ds|ds|gamecube)\b/gi,' ').replace(/\b(?:pal|ntsc|blu[ -]?ray|video game|jeu vid[eé]o|standard edition)\b/gi,' ').replace(/[()[\]]/g,' ').replace(/\s+/g,' ').trim().slice(0,150);
}
export function barcodeLibraryMatches(games,code){const key=barcodeKey(code);return key?games.filter(g=>!g._deletedAt&&barcodeKey(g.physicalBarcode)===key):[];}
