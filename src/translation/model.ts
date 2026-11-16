import {sections,type FieldType} from '../config';
import type {Entry,Value} from '../data';
import {showProfileField} from '../profileFields';
export type Translation={id:string;entryId:string;fieldKey:string;source:string;value:string};
export type TranslationField={id:string;entryId:string;fieldKey:string;section:string;label:string;source:string;text:string};
export type Language='zh'|'en';
const sensitiveIds=new Set(['email','phone','idNumber','wechat','linkedin','github','website','nameEn','number']);
export const translationId=(entryId:string,fieldKey:string)=>JSON.stringify([entryId,fieldKey]);
export function translatable(type:FieldType,id?:string){return !sensitiveIds.has(id||'')&&['text','textarea','select','multiselect'].includes(type)}
const text=(v:Value|undefined)=>typeof v==='string'?v:Array.isArray(v)?v.join('、'):'';
export function translationFields(entries:Entry[]):TranslationField[]{
 const fields:TranslationField[]=[];
 for(const entry of entries){const section=sections.find(s=>s.id===entry.section);if(!section)continue;
  for(const field of section.fields){if((entry.hiddenFields??[]).includes(field.id)||!showProfileField(entry,field.id)||!translatable(field.type,field.id))continue;const value=text(entry.values[field.id]);if(!value.trim())continue;const label=entry.labels[field.id]||field.label;const fieldKey='preset:'+field.id;fields.push({id:translationId(entry.id,fieldKey),entryId:entry.id,fieldKey,section:section.title,label,source:JSON.stringify([label,value]),text:value})}
  for(const field of entry.customFields){if(!translatable(field.type))continue;const value=text(field.value);if(!value.trim())continue;const fieldKey='custom:'+field.id;fields.push({id:translationId(entry.id,fieldKey),entryId:entry.id,fieldKey,section:section.title,label:field.label,source:JSON.stringify([field.label,value]),text:value})}
 }
 return fields;
}
export function selectFields(fields:TranslationField[],selected:ReadonlyMap<string,string>){return fields.filter(f=>selected.get(f.id)===f.source)}
export function changedFields(fields:TranslationField[],translations:Translation[]){const map=new Map(translations.map(t=>[t.id,t]));return fields.filter(field=>map.get(field.id)?.source!==field.source||!map.get(field.id)?.value.trim())}
export function defaultSelection(fields:TranslationField[],translations:Translation[]){return new Map(changedFields(fields,translations).map(field=>[field.id,field.source]))}
export function englishEntry(entry:Entry,translations:Translation[]):Entry{
 const map=new Map(translations.map(t=>[t.id,t]));const section=sections.find(s=>s.id===entry.section);if(!section)return entry;
 const values={...entry.values};for(const f of section.fields){if(translatable(f.type,f.id))values[f.id]=map.get(translationId(entry.id,'preset:'+f.id))?.value||''}
 const customFields=entry.customFields.map(f=>translatable(f.type)?{...f,value:map.get(translationId(entry.id,'custom:'+f.id))?.value||''}:f);
 return {...entry,values,customFields};
}
