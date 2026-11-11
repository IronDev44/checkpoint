import policy from '../data/catalogVisualRights.json';
const replacements=new Map(policy.replacements.map(row=>[row.url,row.replacement]));

export function catalogVisualSource(source){
 if(typeof source!=='string')return source;
 let pathname=source.split(/[?#]/)[0];
 // Existing snapshots sometimes contain an absolute URL to our own catalogue.
 try{const url=new URL(source);if(['checkpoint-eka.pages.dev','localhost','127.0.0.1'].includes(url.hostname))pathname=url.pathname;}catch{}
 return replacements.get(pathname)||source;
}
