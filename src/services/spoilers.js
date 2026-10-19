// Plain text markers only. Unclosed and nested markers stay hidden by default.
export function parseSpoilers(value=''){
 const text=String(value),parts=[];let depth=0,offset=0,buffer='';const marker=/\[(\/?)spoiler\]/gi;let match;
 const push=(content,hidden)=>{if(content)parts.push({text:content,spoiler:hidden});};
 while((match=marker.exec(text))){const chunk=text.slice(offset,match.index);if(depth)buffer+=chunk;else push(chunk,false);
  if(!match[1]){depth++;}else if(depth){depth--;if(!depth){push(buffer,true);buffer='';}}else push(match[0],false);
  offset=marker.lastIndex;
 }
 if(depth)push(buffer+text.slice(offset),true);else push(text.slice(offset),false);return parts;
}
export function spoilerExcerpt(value,limit=180){
 let left=limit,result='';for(const part of parseSpoilers(value)){if(left<=0)break;const text=part.text.slice(0,left);result+=part.spoiler?`[spoiler]${text}[/spoiler]`:text;left-=text.length;if(text.length<part.text.length)result+='…';}return result;
}
export function spoilerSummary(value,whole=false){return whole?'Avis avec spoilers masqués':parseSpoilers(value).map(part=>part.spoiler?'[spoiler masqué]':part.text).join('');}
export function wrapSpoilerSelection(text,start,end){
 const a=Math.max(0,Math.min(start,end)),b=Math.min(text.length,Math.max(start,end));if(a===b)return text;return text.slice(0,a)+'[spoiler]'+text.slice(a,b)+'[/spoiler]'+text.slice(b);
}

export function reviewActivityFields(game,rating=Number(game.rating)||0){
 const shared=game.reviewShared===true||(game.reviewShared!==false&&rating<=0);
 return {reviewText:shared&&game.review?.trim()?spoilerExcerpt(game.review.trim()):'',reviewSpoiler:Boolean(game.reviewSpoiler)};
}
