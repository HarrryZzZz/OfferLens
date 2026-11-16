import {sections} from './config';
import type {Entry} from './data';
function value(entry:Entry,key:string):string {if((entry.hiddenFields??[]).includes(key))return '';const v=entry.values[key];return typeof v==='string'?v.trim():'';}
export function educationTitle(entry:Entry):string {const school=value(entry,'school');const qualification=value(entry,'educationLevel')||value(entry,'degree');return [school,qualification].filter(Boolean).join(' · ');}
export function recordTitle(entry:Entry,fallback='未命名记录'):string {if(entry.section==='education')return educationTitle(entry)||fallback;const section=sections.find(s=>s.id===entry.section);return section?.fields.map(field=>value(entry,field.id)).find(Boolean)||fallback;}
