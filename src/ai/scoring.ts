import type {StoredMatchResult} from './core';
const categories=['技能','经验','教育','其他'] as const;
type Category=typeof categories[number];
type Dimension={category:Category;score:number|null};
export type Scores={overall:number|null;dimensions:Dimension[];verified:number;total:number};
export function hasEvidenceIssue(r:{status:string}):boolean{return 'evidenceIssues' in r&&Array.isArray(r.evidenceIssues)&&r.evidenceIssues.length>0;}
// Required requirements count twice as much as preferred ones. A partial match counts as half.
export function calculateScores(result:StoredMatchResult):Scores|null {
 const requirements=result.requirements;
 if(!requirements.length||requirements.some(r=>!('category' in r)||!('importance' in r)||!categories.includes(r.category as Category)||(r.importance!=='必需'&&r.importance!=='加分')||!['匹配','部分匹配','未匹配'].includes(r.status)))return null;
 function score(items:typeof requirements):number|null{let points=0,total=0;for(const r of items){if(!('importance' in r)||hasEvidenceIssue(r))continue;const weight=r.importance==='必需'?2:1;total+=weight;points+=weight*(r.status==='匹配'?1:r.status==='部分匹配'?.5:0);}return total?Math.round(points/total*100):null}
 return {overall:score(requirements),dimensions:categories.flatMap(category=>{const items=requirements.filter(r=>'category' in r&&r.category===category);return items.length?[{category,score:score(items)}]:[]}),verified:requirements.filter(r=>!hasEvidenceIssue(r)).length,total:requirements.length};
}
