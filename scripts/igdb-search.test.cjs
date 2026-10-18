const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const source=fs.readFileSync('public/_worker.js','utf8').replace(/^import .*;\r?\n/gm,'').replace('export default','const worker =').replace(/^export (?=(?:async )?function)/gm,'');
const queryFor=new Function(`${source}\nreturn buildIgdbSearchQuery;`)();
for(const [ordering,field] of Object.entries({'-rating':'total_rating desc','-released':'first_release_date desc',released:'first_release_date asc',name:'name asc'})){
 test(`IGDB ${ordering} is applied to text searches and filtered browsing`,()=>{
  for(const search of ['Halo','']){const {query}=queryFor(new URLSearchParams({search,ordering,page:'2',platforms:'4',genres:'5',dates:'2001-01-01,2026-12-31'}));assert.ok(query.includes(`sort ${field};`));assert.doesNotMatch(query,/search "/);if(search)assert.ok(query.includes('name ~ *"Halo"*'));assert.match(query,/platforms =/);assert.match(query,/genres =/);assert.match(query,/first_release_date >=/);assert.match(query,/offset 20;/);}
 });
}
test('relevance keeps native IGDB search and never sends an incompatible sort',()=>{
 const {query}=queryFor(new URLSearchParams({search:'Halo',ordering:'relevance'}));assert.match(query,/search "Halo";/);assert.doesNotMatch(query,/sort /);
});
test('search responses request ratings as well as series and edition metadata',()=>{
 const {query}=queryFor(new URLSearchParams({search:'Halo',ordering:'-rating'}));
 assert.match(query,/fields [^;]*total_rating,/);assert.match(query,/fields [^;]*version_parent,/);assert.match(query,/fields [^;]*collections\.name,/);
});
test('search names are escaped and sort fields are limited to the available options',()=>{
 const {query}=queryFor(new URLSearchParams({search:'Halo"; sort id desc;',ordering:'name'}));assert.ok(query.includes('Halo\\"; sort id desc;'));assert.doesNotMatch(query,/search "/);
 const invalid=queryFor(new URLSearchParams({search:'Halo',ordering:'constructor'})).query;assert.doesNotMatch(invalid,/sort /);
});

test('search retrieves fan tags and publication evidence without excluding them upstream',()=>{
 const {query}=queryFor(new URLSearchParams({search:'Sonic'}));
 assert.ok(query.includes('keywords.name'));
 assert.ok(query.includes('involved_companies.publisher'));
 assert.ok(query.includes('involved_companies.company.name'));
 assert.doesNotMatch(query,/keywords\s*(?:!=|=|!~)/);
});
