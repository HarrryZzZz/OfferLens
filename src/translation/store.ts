import {db,type Entry} from '../data';
import {translationFields,type Language,type Translation} from './model';
export async function getLanguage():Promise<Language>{return (await db.settings.get('language'))?.value==='en'?'en':'zh'}
export async function setLanguage(value:Language){await db.settings.put({key:'language',value})}
export async function applyTranslations(updates:Translation[],before:Translation[]){
 await db.transaction('rw',db.records,db.translations,async()=>{const entries=await db.records.toArray();const fields=new Map(translationFields(entries).map(f=>[f.id,f]));const old=new Map(before.map(t=>[t.id,t]));for(const item of updates){const current=await db.translations.get(item.id);if(fields.get(item.id)?.source!==item.source||JSON.stringify(current??null)!==JSON.stringify(old.get(item.id)??null))throw new Error('翻译期间档案或英文内容发生了变化，请重新翻译，原有内容未改变。')}await db.translations.bulkPut(updates)});
}
export async function clearEnglishEntry(entryId:string){await db.translations.where('entryId').equals(entryId).delete()}
export async function saveEnglish(entry:Entry,updates:Translation[],before:Translation[]){await db.transaction('rw',db.records,db.translations,async()=>{const current=await db.records.get(entry.id);if(!current||current.updatedAt!==entry.updatedAt)throw new Error('档案已变化，请重新打开后编辑。');const previous=new Map(before.map(t=>[t.id,t]));for(const update of updates){const now=await db.translations.get(update.id);if(JSON.stringify(now??null)!==JSON.stringify(previous.get(update.id)??null))throw new Error('英文内容已在其他页面更改，请重新打开后编辑。')}await db.translations.bulkPut(updates)})}
