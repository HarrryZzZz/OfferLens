import Dexie, {type Table} from 'dexie';
import {z} from 'zod';
import {sections, type FieldType} from './config';
import type {AnalysisHistory} from './ai/history';
const typeSchema=z.enum(['text','textarea','number','date','select','multiselect','checkbox','url']);
const valueSchema=z.union([z.string(),z.boolean(),z.array(z.string())]);
const customSchema=z.object({id:z.string().min(1),label:z.string().trim().min(1),type:typeSchema,options:z.array(z.string()),value:valueSchema}).strict();
const recordSchema=z.object({id:z.string().min(1),section:z.string(),createdAt:z.string().datetime(),updatedAt:z.string().datetime(),values:z.record(z.string(),valueSchema),labels:z.record(z.string(),z.string().trim().min(1)),hiddenFields:z.array(z.string().min(1)).default([]),customFields:z.array(customSchema)}).strict();
const schema=z.object({schemaVersion:z.literal(1),records:z.array(recordSchema)}).strict().superRefine((data,ctx)=>{
 const ids=new Set<string>(); const singles=new Set<string>();
 data.records.forEach((record,i)=>{ const section=sections.find(s=>s.id===record.section); const issue=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message,path:['records',i]});
 if(ids.has(record.id)) issue('记录 ID 重复'); ids.add(record.id); if(!section){issue('未知分类');return;} if(section.single){if(singles.has(section.id))issue('单条分类存在重复记录');singles.add(section.id);}
 const fieldIds=new Set<string>(); for(const field of record.customFields){if(fieldIds.has(field.id))issue('自定义字段 ID 重复');fieldIds.add(field.id); if(field.options.some(o=>!o.trim())||new Set(field.options).size!==field.options.length)issue('字段选项无效'); if(!validValue(field.type,field.value,field.options)) issue(`字段「${field.label}」的值无效`);}
 for(const [key,value] of Object.entries(record.values)){const spec=section.fields.find(f=>f.id===key);if(!spec || !validValue(spec.type,value,spec.options||[]))issue(`预设字段 ${key} 无效`);}
 for(const key of Object.keys(record.labels)) if(!section.fields.some(f=>f.id===key))issue(`未知字段名称 ${key}`);
 if(new Set(record.hiddenFields).size!==record.hiddenFields.length || record.hiddenFields.some(id=>!section.fields.some(f=>f.id===id)))issue('隐藏字段无效');
 });
});
export type Value=z.infer<typeof valueSchema>; export type CustomField=z.infer<typeof customSchema>; export type Entry=z.infer<typeof recordSchema>; export type Backup=z.infer<typeof schema>;
export function validValue(type:FieldType,value:Value,options:string[]=[]):boolean {if(type==='checkbox')return typeof value==='boolean'; if(type==='multiselect')return Array.isArray(value)&&value.every(v=>options.includes(v))&&new Set(value).size===value.length; if(typeof value!=='string')return false;if(!value)return true; if(type==='number')return Number.isFinite(Number(value)); if(type==='date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;} if(type==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); if(type==='url'){try {return ['http:','https:'].includes(new URL(value).protocol)}catch{return false}} if(type==='select')return options.includes(value);return true;}
export function validateBackup(input:unknown):Backup{return schema.parse(input)}
export function newEntry(section:string):Entry {const now=new Date().toISOString();return {id:crypto.randomUUID(),section,createdAt:now,updatedAt:now,values:{},labels:{},hiddenFields:[],customFields:[]}}
class Database extends Dexie {records!:Table<Entry,string>;analyses!:Table<AnalysisHistory,string>;constructor(){super('OfferLens');this.version(1).stores({records:'id,section,updatedAt'});this.version(2).stores({records:'id,section,updatedAt',analyses:'id,createdAt'});}}
export const db=new Database();
export async function listEntries(){return db.records.toArray()}
export async function saveEntry(entry:Entry){const updated={...entry,updatedAt:new Date().toISOString()};const [validated]=validateBackup({schemaVersion:1,records:[updated]}).records;await db.records.put(validated);return validated}
export async function deleteEntry(id:string){await db.records.delete(id)}
export async function exportBackup():Promise<Backup>{return validateBackup({schemaVersion:1,records:await listEntries()})}
export async function replaceBackup(data:unknown){const parsed=validateBackup(data);await db.transaction('rw',db.records,async()=>{await db.records.clear();await db.records.bulkAdd(parsed.records)});}
