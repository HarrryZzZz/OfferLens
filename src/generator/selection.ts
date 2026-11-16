import {sections} from '../config';
import type {Entry,Value} from '../data';
import {type Language,type Translation} from '../translation/model';
import {buildResume,type ResumeData} from './model';
export type FieldChoice={key:string;label:string;value:string};
export type RecordChoice={included:boolean;fields:string[]};
export type Choices=Record<string,RecordChoice>;
export type ResumeOrder=Record<string,string[]>;
export const orderGroups:Record<string,string[]>={education:['education'],work:['work'],projects:['projects'],activities:['activities'],skills:['languages','skills']};
const defaults:Record<string,string[]>={personal:['nameZh','nameEn','phone','email','wechat'],education:['school','educationLevel','degree','major','endDate','courses'],work:['company','role','startDate','endDate','current','responsibilities'],projects:['name','role','startDate','endDate','responsibilities','projectDuties','descriptionAndDuties'],activities:['organization','role','startDate','endDate','responsibilities'],skills:['name','level'],languages:['name','proficiency']};
const text=(v:Value|undefined)=>v===undefined?'':Array.isArray(v)?v.join('、'):typeof v==='boolean'?(v?'是':''):v;
export const candidateSections=new Set(Object.keys(defaults));
export function availableFields(entry:Entry):FieldChoice[]{const section=sections.find(s=>s.id===entry.section);if(!section)return [];const preset=section.fields.filter(f=>!(entry.hiddenFields??[]).includes(f.id)&&text(entry.values[f.id]).trim()).map(f=>({key:'preset:'+f.id,label:entry.labels[f.id]||f.label,value:text(entry.values[f.id])}));return [...preset,...entry.customFields.filter(f=>text(f.value).trim()).map(f=>({key:'custom:'+f.id,label:f.label,value:text(f.value)}))]}
export function initialChoices(entries:Entry[]):Choices{return Object.fromEntries(entries.filter(e=>candidateSections.has(e.section)&&availableFields(e).length).map(entry=>[entry.id,{included:true,fields:availableFields(entry).filter(f=>f.key.startsWith('preset:')&&(defaults[entry.section]||[]).includes(f.key.slice(7))).map(f=>f.key)}]))}
function timeKey(entry:Entry):string{if(entry.section==='work'&&entry.values.current===true)return '9999-12-31';return [entry.values.endDate,entry.values.startDate].filter((v):v is string=>typeof v==='string'&&/^\d{4}-\d{2}/.test(v)).sort().at(-1)||''}
export function initialOrder(entries:Entry[]):ResumeOrder{return Object.fromEntries(Object.entries(orderGroups).map(([group,ids])=>{const items=entries.filter(e=>ids.includes(e.section)&&availableFields(e).length);if(group!=='skills')items.sort((a,b)=>timeKey(b).localeCompare(timeKey(a))||b.createdAt.localeCompare(a.createdAt));return [group,items.map(e=>e.id)]}))}
export function buildSelectedResume(entries:Entry[],translations:Translation[],language:Language,choices:Choices,order?:ResumeOrder):ResumeData{
 const filtered=entries.filter(e=>choices[e.id]?.included).map(e=>{const allowed=new Set(choices[e.id]?.fields||[]);const section=sections.find(s=>s.id===e.section);return {...e,hiddenFields:[...new Set([...(e.hiddenFields||[]),...(section?.fields.filter(f=>!allowed.has('preset:'+f.id)).map(f=>f.id)||[])])],customFields:e.customFields.filter(f=>allowed.has('custom:'+f.id))}});
 const result=buildResume(filtered,translations,language);const activeOrder=order||initialOrder(entries);return {...result,sections:result.sections.map((section,i)=>{const group=section.key||['education','work','projects','activities','skills'][i];const ids=activeOrder[group]||[];return {...section,items:[...section.items].sort((a,b)=>{const ai=ids.indexOf(a.sourceId||''),bi=ids.indexOf(b.sourceId||'');return (ai<0?Number.MAX_SAFE_INTEGER:ai)-(bi<0?Number.MAX_SAFE_INTEGER:bi)})}})};
}
