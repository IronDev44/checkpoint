// One-time, reviewable migration of rendered UI copy. Stored IDs, values and
// user/game data are never rewritten by this script.
const fs=require('fs'),path=require('path'),parser=require('@babel/parser'),traverse=require('@babel/traverse').default,t=require('@babel/types'),generate=require('@babel/generator').default;
const files=[];function walk(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);if(d.isDirectory()&&d.name!=='i18n'&&d.name!=='assets')walk(f);else if(d.isFile()&&/\.(js|jsx)$/.test(f)&&!/[.](test|spec)[.]/.test(f))files.push(f);}}walk('src');
const source=new Set(fs.existsSync('src/i18n/locales/fr.json')?Object.keys(JSON.parse(fs.readFileSync('src/i18n/locales/fr.json'))):[]),backups='.account-backups/i18n/originals',changed=[];
const brand=/^(Checkpoint(?: 2077)?|CHECKPOINT|Steam|PlayStation(?: [\d]+)?|Xbox|Nintendo|PC|VR|Google|Discord|Twitch|YouTube|Instagram|TikTok|XP|FPS|RPG|PSN|PNG|JPEG|JSON|PDF|RAWG|IGDB|DLC|VS|EUR|USD)$/i;
const french=s=>/[àâçéèêëîïôùûüœ]/i.test(s)||/\b(le|la|les|un|une|des|du|de|ton|ta|tes|mon|ma|mes|pour|dans|avec|sur|tu|aucun|aucune|choisir|ajouter|voir|jeux|jeu|niveau|profil|options|collection|accueil|social|notes|favoris|fermer|annuler|retour|suivant|terminer|rechercher|enregistrer|modifier|supprimer|chargement|erreur|attention|confirmer|infos|statut|plateforme|genres|actualiser|notifications|continuer|importer|exporter|date|nom|tout|tous|toutes|wishlist)\b/i.test(s);
const human=s=>s.length>1&&s.length<6000&&/[A-Za-zÀ-ÿ]/.test(s)&&!brand.test(s.trim())&&!/^\s*(https?:|data:|\/|#|checkpoint-|theme-|auth\/|--|[A-Za-z\d_-]+\.(png|jpg|webp|svg))/i.test(s)&&!s.includes('=>')&&(french(s)||/^[A-ZÀ-Ý][A-Za-zÀ-ÿ’' -]{2,}$/.test(s));
function add(s){const n=s.replace(/\s+/g,' ').trim();if(human(n))source.add(n);}
const element=(name,attrs)=>t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(name),attrs,true),null,[],true);
const attr=(name,value)=>t.jsxAttribute(t.jsxIdentifier(name),t.jsxExpressionContainer(value));
const jsxValue=value=>element('LocalizedValue',[attr('value',value)]);
function containsJSX(node){if(!node||typeof node!=='object')return false;if(t.isJSXElement(node)||t.isJSXFragment(node))return true;return Object.entries(node).some(([key,value])=>!['loc','start','end','extra','comments'].includes(key)&&(Array.isArray(value)?value.some(containsJSX):containsJSX(value)));}
function protectedValue(node){if((t.isMemberExpression(node)||t.isOptionalMemberExpression(node))&&node.property.name==='children')return true;const s=generate(node,{compact:true}).code;return /\b(game|winner|friend|user|profile|player|review|comment|post|entry|item|result)\??\.(name|displayName|pseudo|username|bio|review|comment|content|body|text|description|description_raw)\b/.test(s)||/^(children|name|pseudo|username|bio|review|comment|content|description|synopsis|quote)$/.test(s);}
function combine(left,right){if(t.isStringLiteral(left)&&t.isStringLiteral(right))return t.stringLiteral(left.value+right.value);return t.binaryExpression('+',left,right);}
function alternatives(node){if(t.isStringLiteral(node))return[node.value];if(t.isConditionalExpression(node))return [...alternatives(node.consequent),...alternatives(node.alternate)];if(t.isBinaryExpression(node,{operator:'+'})){const a=alternatives(node.left),b=alternatives(node.right);if(a.length*b.length>32)return[];return a.flatMap(x=>b.map(y=>x+y));}return[];}
function group(nodes){
 const clean=t.react.buildChildren({children:nodes});if(!clean.length)return nodes;
 if(clean.length===1&&!t.isStringLiteral(clean[0]))return protectedValue(clean[0])?nodes:[jsxValue(clean[0])];
 let value=t.stringLiteral(''),values=[];
 function append(node){
  if(t.isStringLiteral(node)){value=combine(value,node);return;}
  if(t.isTemplateLiteral(node)){node.quasis.forEach((q,i)=>{value=combine(value,t.stringLiteral(q.value.cooked||q.value.raw));if(node.expressions[i])append(node.expressions[i]);});return;}
  if(t.isConditionalExpression(node)&&t.isStringLiteral(node.consequent)&&t.isStringLiteral(node.alternate)){value=combine(value,node);return;}
  value=combine(value,t.stringLiteral('{{'+values.length+'}}'));values.push(node);
 }
 clean.forEach(append);const variants=alternatives(value);
 if(!variants.some(s=>/[A-Za-zÀ-ÿ]/.test(s)&&!brand.test(s.trim())))return nodes.map(n=>t.isJSXExpressionContainer(n)&&!t.isJSXEmptyExpression(n.expression)&&!protectedValue(n.expression)?jsxValue(n.expression):n);
 variants.forEach(s=>{const n=s.replace(/\s+/g,' ').trim();if(n&&/[A-Za-zÀ-ÿ]/.test(n)&&!brand.test(n))source.add(n);});
 return[element('LocalizedMessage',[attr('source',value),attr('values',t.arrayExpression(values))])];
}
for(const file of files){
 const original=fs.readFileSync(file,'utf8'),ast=parser.parse(original,{sourceType:'module',plugins:['jsx']});let touched=false,hasJSX=false;const used=new Set();
 // Source-language dictionary includes data-driven labels, messages and tutorials.
 traverse(ast,{StringLiteral(p){if(human(p.node.value))add(p.node.value);},TemplateLiteral(p){const s=p.node.quasis.map((q,i)=>(q.value.cooked||q.value.raw)+(i<p.node.expressions.length?'{{'+i+'}}':'')).join('');add(s);}});
 traverse(ast,{JSXElement:{exit(p){
  const node=p.node,name=node.openingElement.name;if(!t.isJSXIdentifier(name)||/^(Localized|ThemeWordmark|Cyber2077Wordmark)/.test(name.name))return;
  if(['style','script','textarea','code','pre'].includes(name.name))return;
  hasJSX=true;
  if(/^[a-z]/.test(name.name)){
   const attrs=node.openingElement.attributes;
   if(attrs.some(a=>t.isJSXAttribute(a)&&['title','placeholder','aria-label','aria-description','aria-valuetext'].includes(a.name.name))){
    attrs.unshift(attr('__as',t.stringLiteral(name.name)));node.openingElement.name=t.jsxIdentifier('LocalizedElement');if(node.closingElement)node.closingElement.name=t.jsxIdentifier('LocalizedElement');used.add('LocalizedElement');touched=true;
   }
  }
  const children=[];let buffer=[];function flush(){if(!buffer.length)return;const result=group(buffer);for(const item of result){if(t.isJSXElement(item)&&['LocalizedMessage','LocalizedValue'].includes(item.openingElement.name.name)){used.add(item.openingElement.name.name);touched=true;}}children.push(...result);buffer=[];}
  for(const child of node.children){if(t.isJSXElement(child)||t.isJSXFragment(child)||t.isJSXSpreadChild(child)||t.isJSXExpressionContainer(child)&&containsJSX(child.expression)){flush();children.push(child);}else buffer.push(child);}flush();node.children=children;
 }}});
 if(!touched)continue;
 // Subscribe components to locale changes so date formatting and computed UI
 // labels update without remounting forms or the application.
 traverse(ast,{Function(p){
  let name=p.node.id?.name;
  if(!name&&t.isVariableDeclarator(p.parent))name=p.parent.id.name;
  if(!name||!/^[A-Z]/.test(name))return;
  if(t.isBlockStatement(p.node.body)&&p.node.body.body.some(statement=>t.isExpressionStatement(statement)&&t.isCallExpression(statement.expression)&&t.isIdentifier(statement.expression.callee,{name:'useLanguage'})||t.isVariableDeclaration(statement)&&statement.declarations.some(d=>t.isCallExpression(d.init)&&t.isIdentifier(d.init.callee,{name:'useLanguage'}))))return;
  let jsx=false;p.traverse({JSXElement(q){jsx=true;q.stop();}});if(!jsx)return;
  const call=t.expressionStatement(t.callExpression(t.identifier('useLanguage'),[]));
  if(t.isBlockStatement(p.node.body))p.node.body.body.unshift(call);else p.node.body=t.blockStatement([call,t.returnStatement(p.node.body)]);
  used.add('useLanguage');
 }});
 traverse(ast,{CallExpression(p){const callee=p.node.callee;if(t.isMemberExpression(callee)&&['toLocaleDateString','toLocaleTimeString','toLocaleString'].includes(callee.property.name)&&t.isStringLiteral(p.node.arguments[0],{value:'fr-FR'})){p.node.arguments[0]=t.callExpression(t.identifier('getIntlLocale'),[]);used.add('getIntlLocale');}},NewExpression(p){if(t.isMemberExpression(p.node.callee)&&t.isIdentifier(p.node.callee.object,{name:'Intl'})&&t.isStringLiteral(p.node.arguments[0],{value:'fr-FR'})){p.node.arguments[0]=t.callExpression(t.identifier('getIntlLocale'),[]);used.add('getIntlLocale');}}});
 let relative=path.relative(path.dirname(file),'src/i18n').replaceAll('\\','/');if(!relative.startsWith('.'))relative='./'+relative;
 const ui=[...used].filter(x=>x.startsWith('Localized')),hooks=[...used].filter(x=>!x.startsWith('Localized'));
 for(const [names,target] of [[ui,relative+'/Localized'],[hooks,relative+'/language']]){if(!names.length)continue;const existing=ast.program.body.find(n=>t.isImportDeclaration(n)&&n.source.value===target);if(existing){for(const name of names)if(!existing.specifiers.some(n=>n.local.name===name))existing.specifiers.push(t.importSpecifier(t.identifier(name),t.identifier(name)));}else ast.program.body.unshift(t.importDeclaration(names.map(n=>t.importSpecifier(t.identifier(n),t.identifier(n))),t.stringLiteral(target)));}
 const output=generate(ast,{retainLines:true,comments:true,jsescOption:{minimal:true}},original).code+'\n';
 const backup=path.join(backups,file);fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.writeFileSync(backup,original);fs.writeFileSync(file,output);changed.push(file);
}
fs.mkdirSync('src/i18n/locales',{recursive:true});fs.writeFileSync('src/i18n/locales/fr.json',JSON.stringify(Object.fromEntries([...source].sort().map(s=>[s,s])),null,2)+'\n');
for(const code of ['en','es','de','it','pt'])if(!fs.existsSync('src/i18n/locales/'+code+'.json'))fs.writeFileSync('src/i18n/locales/'+code+'.json','{}\n');
fs.writeFileSync('.account-backups/i18n/changed-files.json',JSON.stringify(changed,null,2));console.log({changedFiles:changed.length,messages:source.size,characters:[...source].join('').length});
